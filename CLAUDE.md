# 8ake

베이킹 레시피 CRUD + 회고(1:N) + 재료 리뷰 통합 모바일/태블릿 웹앱.

## 문서 참조

구현 전 반드시 확인:

- PRD: `docs/00-pm/ui.prd.md`
- 구현 계획: `docs/01-plan/features/ui.plan.md`
- 설계 (FSD 구조, API, 스키마, 토큰): `docs/02-design/features/ui.design.md`
- 디자인 시안: `docs/design-mockups/*.html`

## 개발 명령어

```bash
npm run dev        # Vite 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

## 기술 스택

Vite 8 + React 19 + TypeScript / TailwindCSS v4 (CSS-first) / shadcn/ui (new-york) / TanStack Router (파일 기반) / zustand 5 / react-hook-form 7 + zod 4 / recharts 3.8 / sonner / Supabase (Auth OTP + DB/RLS + Storage) / Vercel

## FSD 아키텍처

```
app → routes → pages → widgets → features → entities → shared
```

| 레이어     | 역할                                                      | 의존 가능                  |
| ---------- | --------------------------------------------------------- | -------------------------- |
| `routes`   | TanStack Router 파일 라우트 — pages import 후 re-export만 | pages 이하                 |
| `pages`    | widget 조합만 — 비즈니스 로직/API 호출 금지               | widgets 이하               |
| `widgets`  | 독립 UI 블록 (features + entities 조합)                   | features, entities, shared |
| `features` | 사용자 인터랙션 단위                                      | entities, shared           |
| `entities` | 도메인 타입 + API 훅                                      | shared                     |
| `shared`   | 공통 유틸, UI 프리미티브                                  | 없음                       |

**금지 사항**

- 같은 레이어 간 참조 금지 (widget → widget 금지)
- 하위 레이어에서 상위 레이어 참조 금지
- 슬라이스 외부에서 내부 파일 직접 import 금지 → 반드시 `index.ts` 경유
- `src/components/ui/` (shadcn 원본) 직접 수정 금지 → `src/shared/ui/`에서 래핑

## 디렉토리 구조

```
src/
├── app/            # 진입점, 프로바이더, index.css
├── routes/         # TanStack Router 파일 라우트
├── pages/          # widget 조합 페이지
├── widgets/        # 독립 UI 블록
├── features/       # 사용자 인터랙션 단위
├── entities/       # 도메인 타입 + API 훅
├── shared/
│   ├── api/        # supabase-client.ts (싱글톤)
│   ├── ui/         # 래핑/커스텀 컴포넌트
│   ├── styles/     # tokens.css, shadcn-theme.css, tailwind-theme.css
│   ├── hooks/      # 공통 훅
│   ├── lib/        # cn() 등
│   └── model/      # ui-store.ts (zustand)
└── components/ui/  # shadcn/ui 원본 (수정 금지)
```

## 코딩 컨벤션

- 파일명: **kebab-case** (`recipe-card.tsx`, `use-recipes.ts`)
- export: **named export only** (default export 금지)
- import alias: `@/` → `src/`
- 슬라이스 내부: `ui/`, `model/`, `api/` 폴더 분리

## 스타일링

- TailwindCSS v4: `tailwind.config.js` 없음, CSS `@theme {}` 방식
- 디자인 토큰: `src/shared/styles/tokens.css` (CSS 변수) — 하드코딩 색상 금지
- 다크모드: `[data-theme="dark"]` 속성 기반
- 반응형: mobile-first, `md:` (768px+), 데스크탑 미지원 (최대폭 1024px)
- 폰트: Pretendard (`--font-sans`) / 아이콘: lucide-react (이모지 금지)

## 상태 / 데이터

- zustand: `features/auth/model/auth-store.ts`, `shared/model/ui-store.ts`
- 데이터 패칭: 커스텀 훅 + Supabase 직접 호출 (TanStack Query 미사용)
- Supabase 클라이언트: `shared/api/supabase-client.ts` 싱글톤만 사용

## 커밋 컨벤션

`feat` / `fix` / `design` / `refactor` / `chore` / `docs` / `test` / `revert`

## design/ 폴더 구조

```
design/
├── brief/          ← 기능별 디자인 브리프 문서 (.md)
├── <skill-name>/   ← 스킬이 생성한 스크린샷/이미지
└── _common/        ← 스킬을 특정할 수 없는 스크린샷/이미지
```

### brief/ — 디자인 브리프 문서

기능 단위로 디자인 의도·섹션 명세·인터랙션 모델·카피 원칙을 기록한 마크다운 문서.  
**파일명**: `<feature-slug>.md` (예: `landing-page.md`, `recipe-detail.md`)

브리프 문서에 포함해야 할 항목:

| 섹션                       | 내용                              |
| -------------------------- | --------------------------------- |
| Feature Summary            | 기능 목적 한 문단                 |
| Target Audience            | 주 사용자 + 정서적 상태           |
| Primary User Action        | 핵심 CTA 흐름                     |
| Design Direction           | 무드·팔레트·폰트 방향             |
| Page / Component Structure | 위젯 트리                         |
| Section Specs              | 섹션별 레이아웃·타이포·애니메이션 |
| Interaction Model          | 이징·스태거·트리거 기준           |
| Copy Principles            | 문구 규칙                         |
| What Was Removed           | 제거 항목 + 이유                  |
| Open Questions             | 미결 사항                         |

> 구현이 완료되면 브리프 상단 `상태: 구현 완료`로 업데이트한다.

---

## 디자인 스킬 출력 규칙

스킬이 생성하는 모든 스크린샷/이미지는 `design/` 하위에 저장한다. 루트 직접 저장 금지.

### 저장 경로 결정 규칙

```
design/
├── <skill-name>/   ← 파일명에 스킬명이 포함되면 해당 폴더
└── _common/        ← 스킬명을 특정할 수 없으면 여기
```

**스킬명 판별 기준**: 파일명이 `<skill>-*` 또는 `*-<skill>` 또는 `*<skill>*` 패턴이면 해당 스킬 폴더에 저장.  
**판별 불가**: 어떤 스킬명도 포함되지 않으면 `_common/`에 저장.

### 스킬 → 폴더 매핑

| 스킬       | 폴더                 |
| ---------- | -------------------- |
| impeccable | `design/impeccable/` |
| bolder     | `design/bolder/`     |
| clarify    | `design/clarify/`    |
| distill    | `design/distill/`    |
| layout     | `design/layout/`     |
| colorize   | `design/colorize/`   |
| typeset    | `design/typeset/`    |
| delight    | `design/delight/`    |
| animate    | `design/animate/`    |
| overdrive  | `design/overdrive/`  |
| quieter    | `design/quieter/`    |
| 판별 불가  | `design/_common/`    |

> 새 스킬이 추가되면 위 표에 행을 추가한다.
