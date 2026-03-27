#!/bin/bash
# markup-guard.sh — PostToolUse(Write|Edit) hook
# wrapper <div> + 자식 margin 패턴 감지 (flex gap으로 대체해야 함)

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

[ -z "$file_path" ] && exit 0
[[ "$file_path" != *"/src/"* ]] && exit 0
[[ "$file_path" != *.tsx ]] && exit 0
[ ! -f "$file_path" ] && exit 0

violations=""

# 패턴: <div> 단독(className 없거나 빈 div) 바로 다음 줄에 mt-* 클래스를 가진 자식
# "<div>" 또는 "<div >" 뒤에 mt-N 패턴이 같은 블록 내 존재하는지 감지
if grep -qE '^[[:space:]]*<div>[[:space:]]*$' "$file_path" 2>/dev/null; then
  # 빈 <div> 블록 내 mt-* 자식 확인
  if python3 - "$file_path" <<'EOF' 2>/dev/null
import re, sys
content = open(sys.argv[1]).read()
# 빈 <div> 바로 뒤 블록에서 mt- 클래스 패턴 탐색
blocks = re.findall(r'<div>\s*\n([\s\S]*?)</div>', content)
for b in blocks:
    if re.search(r'className=["\'][^"\']*mt-\d', b):
        print("FOUND")
        break
EOF
  then
    violations="$violations\n  - wrapper <div> + 자식 mt-* 조합 발견: flex flex-col gap-* 으로 대체하세요"
  fi
fi

if [ -n "$violations" ]; then
  echo "⚠️  마크업 규칙 위반: $(basename "$file_path")" >&2
  echo -e "$violations" >&2
  echo "   규칙: .claude/skills/fsd-conventions/SKILL.md '불필요한 wrapper div 금지' 참조" >&2
  exit 1
fi

exit 0
