#!/bin/bash
# fsd-guard.sh — PreToolUse(Write) hook
# FSD 구조 규칙 검사:
#   1. 파일명 kebab-case 강제

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

[ -z "$file_path" ] && exit 0
[[ "$file_path" != *"/src/"* ]] && exit 0

filename=$(basename "$file_path")

# 자동 생성 파일 예외
[[ "$filename" == "routeTree.gen.ts" ]] && exit 0
[[ "$filename" == "components.json" ]] && exit 0

# --- 검사 1: kebab-case 파일명 ---
name="${filename%.*}"
if echo "$name" | grep -qE '[A-Z]|_'; then
  echo "❌ 파일명 규칙 위반: '$filename'" >&2
  echo "   kebab-case를 사용해야 합니다 (예: recipe-card.tsx, use-recipes.ts)" >&2
  exit 2
fi

exit 0
