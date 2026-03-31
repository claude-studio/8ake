---
name: token-check
description: '디자인 토큰 사용 현황을 전체 src/ 코드베이스에서 검증. /token-check 명령 시 하드코딩 색상(hex/rgb/hsl), 미정의 CSS 변수 참조, TailwindCSS v4 규칙 위반, 다크모드 누락을 전수 검사하여 리포트를 출력. 스타일 작업 중 또는 PR 전 확인 시 사용.'
context: fork
agent: Explore
user-invocable: true
---

# 디자인 토큰 전수 검사

`src/` 하위 전체 파일을 검사하고 토큰 위반 사항을 리포트로 출력하세요.

## 기준 파일

먼저 `src/shared/styles/tokens.css`를 읽어 정의된 CSS 변수 목록을 수집하세요.
이 파일에 정의된 `--<name>` 변수만 유효한 토큰입니다.

## 검사 항목

> **구현 현황:**
>
> - ✅ 자동 검사 (token-validate.py): 하드코딩 색상(1), inline style CSS 변수 사용
> - 📋 명세만 있음 (수동 확인 필요): 미정의 CSS 변수 참조(2), TailwindCSS v4 위반(3), 다크모드 토큰 누락(4)

### 1. 하드코딩 색상

다음 패턴이 `className`, `style`, CSS 파일에 사용된 경우 위반:

- HEX: `#[0-9a-fA-F]{3,8}`
- RGB/RGBA: `rgb(`, `rgba(`
- HSL/HSLA: `hsl(`, `hsla(`
- Tailwind 임의 색상: `bg-[#`, `text-[#`, `border-[#`, `fill-[#`, `stroke-[#`

**예외 (검사 제외):**

- `src/shared/styles/tokens.css` — 토큰 정의 파일
- `src/shared/styles/shadcn-theme.css` — shadcn 테마 파일
- `src/components/ui/` — shadcn 원본 (수정 금지 대상, 검사 제외)

### 2. 미정의 CSS 변수 참조

`var(--<name>)` 패턴에서 `<name>`이 `tokens.css`에 없는 경우 위반.

`bg-[var(--card)]`, `text-[var(--foreground)]` 등 Tailwind 임의값 형식도 동일하게 검사.

### 3. TailwindCSS v4 규칙 위반

- `tailwind.config.js` 또는 `tailwind.config.ts` 파일이 존재하면 위반 (v4는 CSS-first)
- `@apply` 지시문 사용 → 권장하지 않음 (경고로 표시)
- `dark:` 접두사 사용 → 위반 (`[data-theme="dark"]` 기반이어야 함)

**정상 패턴 (위반 아님):**

- `shadow-(--xxx)`, `bg-(--xxx)`, `text-(--xxx)`, `border-(--xxx)` — Tailwind v4 CSS variable shorthand 공식 문법
- `bg-[var(--xxx)]`, `text-[var(--xxx)]` — Tailwind arbitrary value 문법 (shorthand와 등가)
- 이 프로젝트는 `eslint-plugin-better-tailwindcss`가 shorthand `(--xxx)` 형식을 강제하므로 `[var(--xxx)]` 형식으로 변환하면 eslint --fix가 되돌림

### 4. 다크모드 컬러 누락

`src/shared/styles/tokens.css`에서 `:root` 에 정의된 색상 변수가 `[data-theme="dark"]` 블록에도 정의되어 있는지 확인. 누락된 변수가 있으면 경고.

---

## 출력 형식

```
## 디자인 토큰 검사 리포트

### 검사 범위
- 파일 수: N개
- 정의된 토큰: N개 (tokens.css 기준)

---

### 위반 사항 (총 N건)

#### 1. 하드코딩 색상 (N건)
| 파일 | 라인 | 내용 | 수정 방향 |
|------|------|------|----------|
| src/widgets/header/ui/header.tsx | 12 | bg-[#F5EDE0] | bg-card 등 canonical 클래스 사용 |

#### 2. 미정의 CSS 변수 (N건)
| 파일 | 라인 | 변수명 |
|------|------|--------|
| src/shared/ui/button.tsx | 8 | var(--primary-hover) |

#### 3. TailwindCSS v4 위반 (N건)
| 파일 | 문제 |
|------|------|
| src/widgets/card/ui/card.tsx | dark: 접두사 사용 |

#### 4. 다크모드 토큰 누락 (N건)
| 변수명 | 상태 |
|--------|------|
| --accent-hover | :root 정의됨, [data-theme="dark"] 누락 |

---

### 요약
위반 없음 ✅  (또는 총 N건 위반 — 수정 필요)
```

위반이 없으면 "✅ 토큰 규칙 위반 없음"만 출력하면 됩니다.
