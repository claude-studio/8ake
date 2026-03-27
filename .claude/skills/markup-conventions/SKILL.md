---
name: markup-conventions
description: '마크업 컨벤션 규칙 위반을 전체 src/ 코드베이스에서 검사. /markup-check 명령 시 wrapper div 안티패턴, cn() 강제 사용, inline style 금지, fieldLabel 하드코딩을 전수 검사하여 위반 리포트를 출력.'
context: fork
agent: Explore
user-invocable: true
---

# 마크업 컨벤션 전수 검사

`src/` 하위 전체 `.tsx` 파일을 검사하고 위반 사항을 리포트로 출력하세요.

전수 검사 실행:

```bash
python3 .claude/skills/markup-conventions/scripts/markup-guard.py
```

## 검사 항목 (6가지)

### 1. wrapper div 안티패턴

props 없는 순수 `<div>` 의 자식이 여백 클래스(`mt-*`, `mb-*`, `pt-*`, `pb-*`) 또는
여백 내장 클래스(`field-label`)를 직접 소유하는 경우 위반.

올바른 패턴: 부모 `<div className="flex flex-col gap-*">` 가 여백 관리.

### 2. className template literal

`className={\`...\${}\`}`형태 사용 →`cn()` 객체 문법으로 교체.

### 3. className 배열 join

`className={[...].join(' ')}` 형태 사용 → `cn()` 으로 교체.

### 4. inline style CSS 변수 사용

`style={{ color: 'var(--primary)' }}` 형태 → `className="text-(--primary)"` 으로 교체.

### 5. fieldLabelStyle 하드코딩

`className="block text-[12px] font-semibold text-muted-foreground"` 형태 →
`className="field-label"` 로 교체.

### 6. (--token) 단축 문법 → canonical Tailwind 클래스

`@theme { --color-surface: ... }` 등으로 등록된 토큰은 canonical Tailwind 클래스 사용 필수.

```
bg-(--surface)     → bg-surface
text-(--primary)   → text-primary
border-(--border)  → border-border
```

감지 토큰: `accent`, `accent-foreground`, `background`, `border`, `card`, `destructive`, `destructive-foreground`, `foreground`, `input`, `muted`, `muted-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `ring`, `secondary`, `secondary-foreground`, `surface`

---

## canonical 클래스 치트시트

`@theme { --color-* }` 로 등록된 토큰은 아래 canonical 클래스를 사용하세요.

```
배경:   bg-background  bg-card  bg-surface  bg-muted  bg-popover
텍스트: text-foreground  text-muted-foreground  text-primary  text-primary-foreground
       text-secondary-foreground  text-accent-foreground  text-destructive-foreground
       text-popover-foreground
테두리: border-border  border-input
주색상: bg-primary  text-primary-foreground
파괴:   bg-destructive  text-destructive-foreground
링:     ring-ring
```

**자주 쓰는 패턴:**

```tsx
// 카드
className = 'rounded-xl border border-border bg-card p-4'

// 주요 버튼 (shadcn Button 사용이 우선)
className = 'rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium'

// 뮤트 텍스트
className = 'text-xs text-muted-foreground'

// sticky 헤더
className = 'sticky top-0 z-40 border-b border-border bg-background backdrop-blur-md'

// 입력 필드 테두리
className = 'border border-input rounded-md'
```
