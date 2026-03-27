#!/bin/bash
# token-validate.sh — PostToolUse(Write|Edit) hook
# 변경된 파일에서 하드코딩 색상 감지 (stderr 피드백)

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

[ -z "$file_path" ] && exit 0
[[ "$file_path" != *"/src/"* ]] && exit 0
[[ "$file_path" != *.ts && "$file_path" != *.tsx && "$file_path" != *.css ]] && exit 0
[ ! -f "$file_path" ] && exit 0

filename=$(basename "$file_path")
[[ "$filename" == "tokens.css" ]] && exit 0
[[ "$filename" == "shadcn-theme.css" ]] && exit 0
[[ "$filename" == "tailwind-theme.css" ]] && exit 0
[[ "$file_path" == *"/components/ui/"* ]] && exit 0

violations=""

while IFS= read -r result; do
  line_num=$(echo "$result" | cut -d: -f1)
  content=$(echo "$result" | cut -d: -f2-)
  if ! echo "$content" | grep -qE "var\(--"; then
    violations="$violations\n  - line $line_num: 하드코딩 hex 색상 → CSS 변수(var(--...)) 사용 권장"
  fi
done < <(grep -nE '#[0-9a-fA-F]{3,8}\b' "$file_path" 2>/dev/null | grep -v "^[[:space:]]*//" | head -5)

while IFS= read -r result; do
  line_num=$(echo "$result" | cut -d: -f1)
  violations="$violations\n  - line $line_num: 하드코딩 rgb/rgba → CSS 변수(var(--...)) 사용 권장"
done < <(grep -nE '\brgba?\s*\(' "$file_path" 2>/dev/null | grep -v "^[[:space:]]*//" | head -5)

if [ -n "$violations" ]; then
  echo "⚠️  하드코딩 색상 감지: $(basename "$file_path")" >&2
  echo -e "$violations" >&2
  echo "   src/shared/styles/tokens.css 의 CSS 변수를 사용하세요." >&2
  exit 1
fi

exit 0
