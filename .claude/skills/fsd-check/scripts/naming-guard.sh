#!/bin/bash
# naming-guard.sh — PreToolUse(Write) hook
# src/ 하위 새 파일 생성 시 kebab-case 파일명 강제 (exit 2로 블로킹)

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

# file_path가 없으면 통과
[ -z "$file_path" ] && exit 0

# src/ 하위가 아니면 통과
[[ "$file_path" != *"/src/"* ]] && exit 0

# 자동 생성 파일 예외
filename=$(basename "$file_path")
[[ "$filename" == "routeTree.gen.ts" ]] && exit 0
[[ "$filename" == "components.json" ]] && exit 0

# 확장자 제거 후 파일명 추출
name="${filename%.*}"

# kebab-case 검사: 대문자 또는 언더스코어 포함 시 위반
if echo "$name" | grep -qE '[A-Z]|_'; then
  echo "❌ 파일명 규칙 위반: '$filename'" >&2
  echo "   kebab-case를 사용해야 합니다 (예: recipe-card.tsx, use-recipes.ts)" >&2
  exit 2
fi

exit 0
