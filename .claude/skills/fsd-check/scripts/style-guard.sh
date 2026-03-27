#!/bin/bash
# style-guard.sh — PostToolUse(Write|Edit) hook
# 스타일 관련 규칙 검사:
#   1. FSD 레이어 의존성 방향 위반
#   2. wrapper <div> + 자식 mt-* 조합 (flex gap으로 대체)
#   3. className에 template literal / 배열 join 사용 (cn() 사용 필요)
#   4. style={{}} 인라인 스타일로 CSS 변수 사용 (className으로 대체)
#   5. cn() 문자열 내 [var(--x)] 구식 문법 사용 (단축 문법 (--x)로 대체)

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

[ -z "$file_path" ] && exit 0
[[ "$file_path" != *"/src/"* ]] && exit 0
[[ "$file_path" != *.ts && "$file_path" != *.tsx ]] && exit 0
[ ! -f "$file_path" ] && exit 0

violations=""

# ─── 검사 1: FSD 레이어 의존성 ───────────────────────────────────────────────

get_layer() {
  case "$1" in
    */app/*)         echo 0 ;;
    */routes/*)      echo 1 ;;
    */pages/*)       echo 2 ;;
    */widgets/*)     echo 3 ;;
    */features/*)    echo 4 ;;
    */entities/*)    echo 5 ;;
    */shared/*)      echo 6 ;;
    */components/ui/*) echo 6 ;;
    *)               echo -1 ;;
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
if [ "$src_layer" -ge 0 ]; then
  while IFS= read -r line; do
    if echo "$line" | grep -qE "from '@/|from \"@/"; then
      import_path=$(echo "$line" | grep -oE "@/[a-z/_-]+" | head -1)
      if [ -n "$import_path" ]; then
        imp_layer=$(get_layer "/src/${import_path#@/}/dummy")
        if [ "$imp_layer" -ge 0 ]; then
          src_name=$(get_layer_name "$src_layer")
          imp_name=$(get_layer_name "$imp_layer")
          if [ "$src_layer" -eq "$imp_layer" ] && [ "$src_layer" -ne 6 ]; then
            violations="$violations\n  [FSD] [$src_name → $src_name] 같은 레이어 간 참조 금지: $import_path"
          elif [ "$src_layer" -gt "$imp_layer" ]; then
            violations="$violations\n  [FSD] [$imp_name → $src_name 역방향] 하위 레이어가 상위를 참조: $import_path"
          fi
        fi
      fi
    fi
  done < "$file_path"
fi

# ─── 검사 2,3: .tsx 파일만 ────────────────────────────────────────────────────

if [[ "$file_path" == *.tsx ]]; then

  # 검사 2: wrapper <div> + 자식 mt-* 조합
  if grep -qE '^[[:space:]]*<div>[[:space:]]*$' "$file_path" 2>/dev/null; then
    if python3 - "$file_path" <<'EOF' 2>/dev/null
import re, sys
content = open(sys.argv[1]).read()
blocks = re.findall(r'<div>\s*\n([\s\S]*?)</div>', content)
for b in blocks:
    if re.search(r'className=["\'][^"\']*mt-\d', b):
        print("FOUND")
        break
EOF
    then
      violations="$violations\n  [마크업] wrapper <div> + 자식 mt-* 조합: flex flex-col gap-* 으로 대체하세요"
    fi
  fi

  # 검사 3: className template literal
  if grep -qE 'className=\{`[^`]*\$\{' "$file_path" 2>/dev/null; then
    violations="$violations\n  [cn] className에 template literal 사용 → cn() 객체 문법으로 교체하세요"
    violations="$violations\n       예) className={\`base \${cond ? 'a' : ''}\`} → className={cn('base', { 'a': cond })}"
  fi

  # 검사 4: className 배열 join
  if grep -qE "\]\.join\(' '\)" "$file_path" 2>/dev/null; then
    violations="$violations\n  [cn] className 배열 join 사용 → cn() 객체 문법으로 교체하세요"
    violations="$violations\n       예) className={['base', cond ? 'a' : 'b'].join(' ')} → className={cn('base', { 'a': cond, 'b': !cond })}"
  fi

  # 검사 5: style={{}} 인라인 스타일로 CSS 변수 사용
  if grep -qE "style=\{\{[^}]*'var\(--" "$file_path" 2>/dev/null; then
    violations="$violations\n  [style] style={{}} 에 CSS 변수 사용 → className으로 대체하세요"
    violations="$violations\n       예) style={{ color: 'var(--primary)' }} → className=\"text-(--primary)\""
  fi

  # 검사 6: cn() 문자열 내 [var(--x)] 구식 문법
  if grep -qE "'[^']*\[var\(--[^)]+\)[^']*'" "$file_path" 2>/dev/null; then
    violations="$violations\n  [cn] cn() 문자열 내 [var(--x)] 구식 문법 → (--x) 단축 문법으로 교체하세요"
    violations="$violations\n       예) 'text-[var(--primary)]' → 'text-(--primary)'"
  fi

fi

# ─── 결과 출력 ────────────────────────────────────────────────────────────────

if [ -n "$violations" ]; then
  echo "⚠️  규칙 위반: $(basename "$file_path")" >&2
  echo -e "$violations" >&2
  echo "   참조: .claude/skills/fsd-conventions/SKILL.md" >&2
  exit 1
fi

exit 0
