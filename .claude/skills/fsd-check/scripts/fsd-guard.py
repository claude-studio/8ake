#!/usr/bin/env python3
"""
fsd-guard.py — FSD 아키텍처 규칙 검사

검사 항목:
  1. 파일명 kebab-case 강제 (PreToolUse: Write)
  2. FSD 레이어 의존성 방향 위반 (PostToolUse: Write|Edit)

사용법:
  # hook 모드 (stdin으로 JSON 수신)
  echo '{"tool_input":{"file_path":"..."}}' | python3 fsd-guard.py

  # 전체 스캔 모드
  python3 fsd-guard.py
"""

import json
import re
import sys
from pathlib import Path

# ─── 레이어 매핑 ──────────────────────────────────────────────────────────────

LAYER_MAP = {
    "/app/": (0, "app"),
    "/routes/": (1, "routes"),
    "/pages/": (2, "pages"),
    "/widgets/": (3, "widgets"),
    "/features/": (4, "features"),
    "/entities/": (5, "entities"),
    "/shared/": (6, "shared"),
    "/components/ui/": (6, "shared"),
}

# TanStack Router 파일 기반 라우팅 특수 파일명 패턴 (kebab-case 예외)
ROUTER_SPECIAL_RE = re.compile(r"^(__root|_[a-z]|.*\$[a-z_])")
SKIP_FILENAMES = {"routeTree.gen.ts", "components.json"}


def get_layer(path: str) -> tuple[int, str]:
    for segment, (num, name) in LAYER_MAP.items():
        if segment in path:
            return num, name
    return -1, "unknown"


# ─── 검사 1: kebab-case 파일명 ────────────────────────────────────────────────

def check_kebab(file_path: str) -> str | None:
    filename = Path(file_path).name
    if filename in SKIP_FILENAMES:
        return None
    # TanStack Router 특수 파일명 예외: __, _auth, $id 등
    if "/routes/" in file_path:
        return None
    name = Path(filename).stem
    if re.search(r"[A-Z]|_", name):
        return f"파일명 kebab-case 위반: '{filename}' → kebab-case 사용 필요"
    return None


# ─── 검사 2: FSD 레이어 의존성 ───────────────────────────────────────────────

IMPORT_RE = re.compile(r"""from\s+['"](@/[^'"]+)['"]""")


def check_layer_deps(file_path: str) -> list[str]:
    src_layer, src_name = get_layer(file_path)
    if src_layer < 0:
        return []

    violations = []
    try:
        lines = Path(file_path).read_text(encoding="utf-8").splitlines()
    except Exception:
        return []

    for line in lines:
        m = IMPORT_RE.search(line)
        if not m:
            continue
        import_path = m.group(1)
        # @/shared 하위 경로를 레이어로 변환
        fake_path = "/src/" + import_path.replace("@/", "")
        imp_layer, imp_name = get_layer(fake_path)
        if imp_layer < 0:
            continue

        if src_layer == imp_layer and src_layer != 6:
            violations.append(
                f"[FSD] 같은 레이어 간 참조 금지 [{src_name} → {src_name}]: {import_path}"
            )
        elif src_layer > imp_layer:
            violations.append(
                f"[FSD] 역방향 참조 [{imp_name} → {src_name}]: {import_path}"
            )

    return violations


# ─── 파일 검사 ────────────────────────────────────────────────────────────────

def check_file(file_path: str) -> list[str]:
    issues = []
    kebab = check_kebab(file_path)
    if kebab:
        issues.append(kebab)
    issues.extend(check_layer_deps(file_path))
    return issues


def should_skip(file_path: str) -> bool:
    return "/src/" not in file_path


# ─── hook 모드 ────────────────────────────────────────────────────────────────

def run_hook_mode() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path or should_skip(file_path):
        return 0
    if not (file_path.endswith(".ts") or file_path.endswith(".tsx")):
        return 0
    if not Path(file_path).is_file():
        return 0

    issues = check_file(file_path)
    if not issues:
        return 0

    import os
    print(f"⚠️  FSD 규칙 위반: {os.path.basename(file_path)}", file=sys.stderr)
    for issue in issues:
        print(f"  {issue}", file=sys.stderr)
    print("   참조: .claude/skills/fsd-check/SKILL.md", file=sys.stderr)
    return 1


# ─── 전체 스캔 모드 ───────────────────────────────────────────────────────────

def run_scan_mode() -> int:
    root = Path(__file__).parent.parent.parent.parent.parent / "src"
    results: dict[str, list[str]] = {}

    for f in sorted(root.rglob("*.ts")) + sorted(root.rglob("*.tsx")):
        fp = str(f)
        if "/components/ui/" in fp and "/shared/ui/" not in fp:
            continue
        issues = check_file(fp)
        if issues:
            results[str(f.relative_to(root.parent))] = issues

    if not results:
        print("✅ FSD 규칙 위반 없음!")
        return 0

    total = sum(len(v) for v in results.values())
    print(f"❌ {len(results)}개 파일, 총 {total}건 발견\n")
    print("=" * 70)
    for filepath, issues in results.items():
        print(f"\n📄 {filepath} ({len(issues)}건)")
        for issue in issues:
            print(f"   {issue}")
    print("\n" + "=" * 70)
    return 1


# ─── 진입점 ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--scan" in sys.argv or sys.stdin.isatty():
        sys.exit(run_scan_mode())
    else:
        sys.exit(run_hook_mode())
