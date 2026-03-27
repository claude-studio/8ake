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

| 레이어 | 역할 | 의존 가능 |
|--------|------|----------|
| `routes` | TanStack Router 파일 라우트 — pages import 후 re-export만 | pages 이하 |
| `pages` | widget 조합만 — 비즈니스 로직/API 호출 금지 | widgets 이하 |
| `widgets` | 독립 UI 블록 (features + entities 조합) | features, entities, shared |
| `features` | 사용자 인터랙션 단위 | entities, shared |
| `entities` | 도메인 타입 + API 훅 | shared |
| `shared` | 공통 유틸, UI 프리미티브 | 없음 |

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
