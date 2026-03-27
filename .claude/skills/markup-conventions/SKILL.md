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

## 검사 항목 (5가지)

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
