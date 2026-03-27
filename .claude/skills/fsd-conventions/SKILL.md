---
name: fsd-conventions
description: "FSD(Feature-Sliced Design) 아키텍처 레이어 규칙과 8ake 코딩 컨벤션. src/ 하위 파일 작업 시 자동 로드되며, 레이어 의존성 방향, public API 원칙, 파일 네이밍, 스타일링 규칙을 Claude 컨텍스트에 주입합니다."
user-invocable: false
paths: "src/**"
---

# 8ake FSD 아키텍처 컨벤션

이 문서는 `src/` 하위 파일 작업 시 항상 적용되는 규칙입니다. 아래 규칙을 어기는 코드는 작성하지 마세요.

## 레이어 계층

```
app(0) → routes(1) → pages(2) → widgets(3) → features(4) → entities(5) → shared(6)
```

각 레이어의 번호가 **낮을수록 상위**입니다. 의존은 항상 **상위 → 하위** 방향만 허용됩니다.

| 레이어 | 역할 | 허용 의존 |
|--------|------|----------|
| `app` | 진입점, 프로바이더, 전역 CSS | 모든 레이어 |
| `routes` | TanStack Router 파일 라우트 | pages 이하 |
| `pages` | widget 조합 + 레이아웃 | widgets 이하 |
| `widgets` | 독립 UI 블록 | features, entities, shared |
| `features` | 사용자 인터랙션 단위 | entities, shared |
| `entities` | 도메인 타입 + API 훅 | shared |
| `shared` | 공통 유틸, UI 프리미티브 | 없음 |

## 핵심 규칙 (절대 위반 금지)

**레이어 규칙**
- 같은 레이어 간 import 금지 — `widgets/a`가 `widgets/b`를 import하면 위반
- 하위 레이어에서 상위 레이어 import 금지 — `entities`가 `features`를 import하면 위반
- `src/components/ui/` (shadcn 원본)는 직접 수정 금지 — `src/shared/ui/`에서 래핑해서 사용

**Public API 원칙**
- 슬라이스 외부에서는 반드시 `index.ts`를 통해서만 import
  - ✅ `import { RecipeCard } from '@/entities/recipe'`
  - ❌ `import { RecipeCard } from '@/entities/recipe/ui/recipe-card'`

**레이어별 역할 제한**
- `routes/`: pages를 import 후 `component`에 할당하는 역할만. `useState`, `useEffect`, fetch 등 로직 금지
- `pages/`: widgets 조합과 레이아웃만. API 훅 직접 호출 금지, 비즈니스 로직 금지

## 코딩 컨벤션

**파일 네이밍**
- 모든 파일: **kebab-case** (`recipe-card.tsx`, `use-recipes.ts`, `auth-store.ts`)
- 예외: `routeTree.gen.ts` (TanStack Router 자동 생성)

**export 방식**
- **named export only** — default export 절대 금지
  - ✅ `export function RecipeCard() {}`
  - ❌ `export default function RecipeCard() {}`

**import alias**
- `@/` → `src/` (절대 경로 사용)

**슬라이스 내부 구조**
```
slice-name/
├── ui/       # React 컴포넌트
├── model/    # 상태, 타입, 스키마
├── api/      # 데이터 패칭 훅
└── index.ts  # public API
```

## 스타일링 규칙

- **TailwindCSS v4**: `tailwind.config.js` 없음, CSS `@theme {}` 방식 사용
- **색상**: `src/shared/styles/tokens.css`의 CSS 변수만 사용 — 하드코딩 금지
  - ✅ `className="bg-[var(--card)]"` 또는 Tailwind 토큰 클래스
  - ❌ `className="bg-[#F5EDE0]"`
- **다크모드**: `[data-theme="dark"]` 속성 기반 — `dark:` 접두사 대신 CSS 변수가 자동 전환
- **반응형**: mobile-first, `md:` (768px+) 브레이크포인트
- **아이콘**: `lucide-react`만 사용 — 이모지 금지
- **폰트**: Pretendard (`--font-sans`)

## 데이터 패칭

- Supabase 클라이언트: `@/shared/api/supabase-client`의 싱글톤만 사용 (직접 생성 금지)
- TanStack Query 사용 금지 — 커스텀 훅 + Supabase 직접 호출
- 훅 위치: `entities/<name>/api/` 또는 `features/<name>/api/`

## 상세 참조

레이어 계층 상세와 위반 패턴은 `fsd-layers.md`를 참고하세요.
