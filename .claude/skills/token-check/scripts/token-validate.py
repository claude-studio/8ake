#!/usr/bin/env python3
"""
token-validate.py — 디자인 토큰 규칙 검사

검사 항목:
  1. 하드코딩 HEX 색상 (#xxx, #xxxxxx)
  2. 하드코딩 rgb/rgba 색상
  3. inline style={{}} 과다 사용 (3개 초과)

예외 파일: tokens.css, shadcn-theme.css, tailwind-theme.css, components/ui/

사용법:
  # hook 모드 (stdin으로 JSON 수신)
  echo '{"tool_input":{"file_path":"..."}}' | python3 token-validate.py

  # 전체 스캔 모드
  python3 token-validate.py
"""

import json
import re
import sys
from pathlib import Path

SKIP_FILENAMES = {"tokens.css", "shadcn-theme.css", "tailwind-theme.css", "index.css"}

HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_RE = re.compile(r"\brgba?\s*\(")
INLINE_STYLE_RE = re.compile(r"style=\{\{")
COMMENT_RE = re.compile(r"^\s*//")

# hex가 var(--...) 안에 있으면 허용 (토큰 정의)
VAR_HEX_RE = re.compile(r"var\(--[^)]*#[0-9a-fA-F]")


def should_skip(file_path: str) -> bool:
    filename = Path(file_path).name
    if filename in SKIP_FILENAMES:
        return True
    if "/components/ui/" in file_path and "/shared/ui/" not in file_path:
        return True
    return False


def check_file(file_path: Path) -> list[tuple[int, str, str]]:
    """위반 목록: [(lineno, check_id, message), ...]"""
    hits = []
    lines = file_path.read_text(encoding="utf-8").splitlines()
    inline_count = 0

    for lineno, line in enumerate(lines, start=1):
        if COMMENT_RE.match(line):
            continue

        # 검사 1: 하드코딩 HEX
        for m in HEX_RE.finditer(line):
            # var(-- 안에 있으면 토큰 정의이므로 허용
            context = line[max(0, m.start() - 6): m.start()]
            if "var(--" not in context:
                hits.append((lineno, "hex-color", f"하드코딩 HEX 색상 → CSS 변수 사용 필요: {m.group(0)}"))
                break

        # 검사 2: 하드코딩 rgb/rgba
        if RGB_RE.search(line):
            hits.append((lineno, "rgb-color", "하드코딩 rgb/rgba → CSS 변수 사용 필요"))

        # 검사 3: inline style 카운트
        if INLINE_STYLE_RE.search(line):
            inline_count += 1

    if inline_count > 3:
        hits.append((0, "inline-style", f"style={{{{}}}} {inline_count}개 → Tailwind 클래스로 대체 필요 (동적 JS값만 허용)"))

    return hits


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
    if not (file_path.endswith(".ts") or file_path.endswith(".tsx") or file_path.endswith(".css")):
        return 0
    if not Path(file_path).is_file():
        return 0
    if should_skip(file_path):
        return 0

    hits = check_file(Path(file_path))
    if not hits:
        return 0

    import os
    print(f"⚠️  토큰 규칙 위반: {os.path.basename(file_path)}", file=sys.stderr)
    for lineno, check_id, msg in hits:
        prefix = f"L{lineno:>4}  " if lineno > 0 else "       "
        print(f"  {prefix}[{check_id}] {msg}", file=sys.stderr)
    print("   src/shared/styles/tokens.css 의 CSS 변수를 사용하세요.", file=sys.stderr)
    return 1


# ─── 전체 스캔 모드 ───────────────────────────────────────────────────────────

def run_scan_mode() -> int:
    root = Path(__file__).parent.parent.parent.parent.parent / "src"
    results: dict[str, list] = {}

    extensions = ["*.ts", "*.tsx", "*.css"]
    files = []
    for ext in extensions:
        files.extend(sorted(root.rglob(ext)))

    for f in files:
        if should_skip(str(f)):
            continue
        hits = check_file(f)
        if hits:
            results[str(f.relative_to(root.parent))] = hits

    if not results:
        print("✅ 토큰 규칙 위반 없음!")
        return 0

    total = sum(len(v) for v in results.values())
    print(f"❌ {len(results)}개 파일, 총 {total}건 발견\n")
    print("=" * 70)
    for filepath, hits in results.items():
        print(f"\n📄 {filepath} ({len(hits)}건)")
        for lineno, check_id, msg in hits:
            prefix = f"L{lineno:>4}" if lineno > 0 else "     "
            print(f"   {prefix}  [{check_id}] {msg}")
    print("\n" + "=" * 70)
    return 1


# ─── 진입점 ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--scan" in sys.argv or sys.stdin.isatty():
        sys.exit(run_scan_mode())
    else:
        sys.exit(run_hook_mode())
