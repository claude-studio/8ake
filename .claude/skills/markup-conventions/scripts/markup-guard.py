#!/usr/bin/env python3
"""
markup-guard.py — 마크업 컨벤션 검사

검사 항목:
  1. wrapper div 안티패턴: props 없는 <div> + 자식이 여백 소유
  2. className template literal 사용 (cn() 강제)
  3. className 배열 join 사용 (cn() 강제)
  4. inline style에 CSS 변수 사용 (className으로 대체)
  5. fieldLabelStyle 하드코딩 (field-label 클래스 사용 필요)
  6. (--token) 단축 문법 → canonical Tailwind 클래스 사용 필요
     예) bg-(--surface) → bg-surface, text-(--primary) → text-primary

사용법:
  # hook 모드 (stdin으로 JSON 수신)
  echo '{"tool_input":{"file_path":"..."}}' | python3 markup-guard.py

  # 전체 스캔 모드
  python3 markup-guard.py --scan
"""

import json
import re
import sys
from pathlib import Path

# ─── 검사 1: wrapper div 설정 ────────────────────────────────────────────────

CHILD_MARGIN_RE = re.compile(
    r'className=["\'][^"\']*\b(mt|mb|pt|pb)-[\d\[]'
)
MARGIN_BEARING_CLASSES = ["field-label"]
BLOCK_TAGS_OPEN = re.compile(r'<(?:div|section|article|main|aside|header|footer|nav)\b')
BLOCK_TAGS_CLOSE = re.compile(r'</(?:div|section|article|main|aside|header|footer|nav)>')


def collect_child_block(lines: list[str], start: int) -> str:
    child_lines = []
    depth = 1
    j = start + 1
    while j < len(lines) and depth > 0:
        l = lines[j]
        depth += len(BLOCK_TAGS_OPEN.findall(l))
        depth -= len(BLOCK_TAGS_CLOSE.findall(l))
        if depth > 0:
            child_lines.append(l)
        j += 1
    return "\n".join(child_lines)


def child_has_margin(child_text: str) -> tuple[bool, str]:
    m = CHILD_MARGIN_RE.search(child_text)
    if m:
        return True, m.group(0)[:60]
    for cls in MARGIN_BEARING_CLASSES:
        if f'className="{cls}"' in child_text or f"className='{cls}'" in child_text:
            return True, f"여백 내장 클래스: {cls}"
    return False, ""


# ─── 검사 6: (--token) 단축 문법 → canonical class ───────────────────────────
# index.css @theme 에 --color-* 로 등록된 토큰 목록
CANONICAL_TOKENS = {
    "accent", "accent-foreground", "background", "border", "card",
    "destructive", "destructive-foreground", "foreground", "input",
    "muted", "muted-foreground", "popover", "popover-foreground",
    "primary", "primary-foreground", "ring", "secondary",
    "secondary-foreground", "surface",
}

# (--token) 패턴 감지: bg-(--surface), text-(--primary) 등
CANONICAL_RE = re.compile(r'\w+-\(--(' + '|'.join(re.escape(t) for t in CANONICAL_TOKENS) + r')\)')


def check_canonical(line: str) -> list[str]:
    matches = CANONICAL_RE.findall(line)
    return list(dict.fromkeys(matches))  # 중복 제거, 순서 유지


# ─── 검사별 함수 ──────────────────────────────────────────────────────────────

def check_file(file_path: Path) -> list[tuple[int, str, str]]:
    """위반 목록 반환: [(lineno, check_id, message), ...]"""
    lines = file_path.read_text(encoding="utf-8").splitlines()
    hits = []

    for i, line in enumerate(lines):
        # 검사 1: wrapper div
        if re.match(r"^\s*<div>\s*$", line):
            child_text = collect_child_block(lines, i)
            found, reason = child_has_margin(child_text)
            if found:
                hits.append((i + 1, "wrapper-div", f"props 없는 <div> + 자식 여백 소유 ({reason})"))

        # 검사 2: className template literal
        if re.search(r'className=\{`[^`]*\$\{', line):
            hits.append((i + 1, "cn-template", "className template literal → cn() 으로 교체"))

        # 검사 3: className 배열 join
        if re.search(r"\]\.join\(' '\)", line):
            hits.append((i + 1, "cn-join", "className 배열 join → cn() 으로 교체"))

        # 검사 4: inline style CSS 변수
        if re.search(r"style=\{\{[^}]*'var\(--", line):
            hits.append((i + 1, "style-cssvar", "style={{}} 에 CSS 변수 사용 → className=(--x) 으로 교체"))

        # 검사 5: fieldLabelStyle 하드코딩
        if re.search(r'block text-\[12px\] font-semibold text-muted-foreground', line):
            hits.append((i + 1, "label-hardcode", 'fieldLabelStyle 하드코딩 → className="field-label" 로 교체'))

        # 검사 6: (--token) 단축 문법 → canonical class
        tokens = check_canonical(line)
        for token in tokens:
            # token에 맞는 canonical prefix 추출
            m = re.search(r'(\w+)-\(--' + re.escape(token) + r'\)', line)
            prefix = m.group(1) if m else "?"
            hits.append((i + 1, "canonical-class",
                f"{prefix}-(--{token}) → {prefix}-{token} (canonical Tailwind 클래스 사용)"))

    return hits


def should_skip(file_path: str) -> bool:
    if "/components/ui/" in file_path and "/shared/ui/" not in file_path:
        return True
    return False


# ─── hook 모드 ────────────────────────────────────────────────────────────────

def run_hook_mode() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        return 0
    if "/src/" not in file_path:
        return 0
    if not file_path.endswith(".tsx"):
        return 0
    if not Path(file_path).is_file():
        return 0
    if should_skip(file_path):
        return 0

    hits = check_file(Path(file_path))
    if not hits:
        return 0

    import os
    print(f"⚠️  마크업 규칙 위반: {os.path.basename(file_path)}", file=sys.stderr)
    for lineno, check_id, msg in hits:
        print(f"  L{lineno:>4}  [{check_id}] {msg}", file=sys.stderr)
    print("   참조: .claude/skills/markup-conventions/SKILL.md", file=sys.stderr)
    return 1


# ─── 전체 스캔 모드 ───────────────────────────────────────────────────────────

def run_scan_mode() -> int:
    root = Path(__file__).parent.parent.parent.parent.parent / "src"
    results: dict[str, list] = {}

    for tsx_file in sorted(root.rglob("*.tsx")):
        if should_skip(str(tsx_file)):
            continue
        hits = check_file(tsx_file)
        if hits:
            results[str(tsx_file.relative_to(root.parent))] = hits

    if not results:
        print("✅ 마크업 컨벤션 위반 없음!")
        return 0

    total = sum(len(v) for v in results.values())
    print(f"❌ {len(results)}개 파일, 총 {total}건 발견\n")
    print("=" * 70)

    for filepath, hits in results.items():
        print(f"\n📄 {filepath} ({len(hits)}건)")
        for lineno, check_id, msg in hits:
            print(f"   L{lineno:>4}  [{check_id}] {msg}")

    print("\n" + "=" * 70)
    return 1


# ─── 진입점 ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--scan" in sys.argv or sys.stdin.isatty():
        sys.exit(run_scan_mode())
    else:
        sys.exit(run_hook_mode())
