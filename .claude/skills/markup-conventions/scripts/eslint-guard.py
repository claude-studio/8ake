#!/usr/bin/env python3
"""
eslint-guard.py — ESLint better-tailwindcss 룰 훅 모드 실행

PostToolUse hook에서 수정된 파일 하나만 빠르게 검사.
감지 룰:
  - enforce-canonical-classes  (aspect-[4/3] → aspect-4/3 등)
  - enforce-consistent-variable-syntax  (border-[var(--x)] → border-(--x))
  - enforce-shorthand-classes  (w-full h-full → size-full 등)
  - no-conflicting-classes
  - no-duplicate-classes

사용법:
  # hook 모드
  echo '{"tool_input":{"file_path":"..."}}' | python3 eslint-guard.py
"""

import json
import os
import subprocess
import sys
from pathlib import Path


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
    if not file_path.endswith((".ts", ".tsx")):
        return 0
    if not Path(file_path).is_file():
        return 0

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    result = subprocess.run(
        ["npx", "eslint", "--max-warnings=0", file_path],
        capture_output=True,
        text=True,
        cwd=project_dir,
    )

    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(run_hook_mode())
