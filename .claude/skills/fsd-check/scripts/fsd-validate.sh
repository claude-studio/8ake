#!/bin/bash
# fsd-validate.sh — PostToolUse(Write|Edit) hook
# 변경된 파일의 import문에서 FSD 레이어 위반 감지 (stderr 피드백)

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

# file_path가 없으면 통과
[ -z "$file_path" ] && exit 0

# src/ 하위 .ts/.tsx 파일만 검사
[[ "$file_path" != *"/src/"* ]] && exit 0
[[ "$file_path" != *.ts && "$file_path" != *.tsx ]] && exit 0

# 파일이 존재하지 않으면 통과
[ ! -f "$file_path" ] && exit 0

# 레이어 번호 매핑 함수
get_layer() {
  case "$1" in
    */app/*) echo 0 ;;
    */routes/*) echo 1 ;;
    */pages/*) echo 2 ;;
    */widgets/*) echo 3 ;;
    */features/*) echo 4 ;;
    */entities/*) echo 5 ;;
    */shared/*) echo 6 ;;
    */components/ui/*) echo 6 ;;
    *) echo -1 ;;
  esac
}

get_layer_name() {
  case "$1" in
    0) echo "app" ;;
    1) echo "routes" ;;
    2) echo "pages" ;;
    3) echo "widgets" ;;
    4) echo "features" ;;
    5) echo "entities" ;;
    6) echo "shared" ;;
    *) echo "unknown" ;;
  esac
}

src_layer=$(get_layer "$file_path")
[ "$src_layer" -eq -1 ] && exit 0

violations=""

# import 문에서 @/ 경로 추출
while IFS= read -r line; do
  if echo "$line" | grep -qE "from '@/|from \"@/"; then
    import_path=$(echo "$line" | grep -oE "@/[a-z/_-]+" | head -1)
    if [ -n "$import_path" ]; then
      imp_layer=$(get_layer "/src/${import_path#@/}/dummy")
      if [ "$imp_layer" -ge 0 ]; then
        src_name=$(get_layer_name "$src_layer")
        imp_name=$(get_layer_name "$imp_layer")
        # 같은 레이어 참조 (단, shared는 허용)
        if [ "$src_layer" -eq "$imp_layer" ] && [ "$src_layer" -ne 6 ]; then
          violations="$violations\n  - [$src_name → $src_name] 같은 레이어 간 참조 금지: $import_path"
        # 하위 레이어에서 상위 레이어 참조
        elif [ "$src_layer" -gt "$imp_layer" ]; then
          violations="$violations\n  - [$imp_name → $src_name 역방향] 하위 레이어가 상위를 참조: $import_path"
        fi
      fi
    fi
  fi
done < "$file_path"

if [ -n "$violations" ]; then
  echo "⚠️  FSD 레이어 위반 감지: $(basename "$file_path")" >&2
  echo -e "$violations" >&2
  echo "   docs/02-design/features/ui.design.md 의 레이어 규칙을 참조하세요." >&2
  exit 1
fi

exit 0
