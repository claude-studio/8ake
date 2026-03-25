# ui — Design Document

> 참조: `docs/01-plan/features/ui.plan.md`

---

## 1. FSD 레이어 원칙

```
app → routes → pages → widgets → features → entities → shared
```

| 레이어 | 역할 | 의존 가능 |
|--------|------|----------|
| `app` | 앱 진입점, 프로바이더 | 모든 레이어 |
| `routes` | TanStack Router 파일 라우트 (pages import 후 re-export) | pages 이하 |
| `pages` | widget 조합 → 라우트에 내보내기 | widgets 이하 |
| `widgets` | 독립적인 UI 블록 (features + entities 조합) | features, entities, shared |
| `features` | 사용자 인터랙션 단위 | entities, shared |
| `entities` | 도메인 타입 + API 훅 | shared |
| `shared` | 공통 유틸, UI 프리미티브 | 없음 |

**규칙**
- 같은 레이어 간 참조 금지 (예: widget → widget 금지)
- 상위 레이어는 하위 레이어만 참조
- 각 슬라이스는 `index.ts`를 통해서만 외부 노출 (public API)

---

## 2. 프로젝트 구조 (FSD + kebab-case)

```
src/
├── main.tsx
│
├── app/
│   ├── app.tsx                              # createRouter + RouterProvider
│   ├── providers.tsx                        # ThemeProvider 등 전역 프로바이더
│   └── index.css                            # @import "tailwindcss" + @theme
│
├── routes/                                  # TanStack Router 파일 기반 라우트
│   ├── __root.tsx                           # 루트 컨텍스트 (auth 주입)
│   ├── login.tsx                            # → LoginPage import
│   ├── _auth.tsx                            # beforeLoad 인증 가드 + AppLayout
│   └── _auth/
│       ├── index.tsx                        # → RecipeListPage import
│       ├── recipe/
│       │   ├── new.tsx                      # → RecipeFormPage import (mode: create)
│       │   ├── $id.tsx                      # → RecipeDetailPage import
│       │   └── $id_.edit.tsx                # → RecipeFormPage import (mode: edit)
│       └── ingredients.tsx                  # → IngredientPage import
│
├── pages/                                   # widget 조합 페이지 컴포넌트
│   ├── login/
│   │   ├── ui/
│   │   │   └── login-page.tsx               # LoginForm widget 조합
│   │   └── index.ts                         # export { LoginPage }
│   ├── recipe-list/
│   │   ├── ui/
│   │   │   └── recipe-list-page.tsx         # RecipeGrid widget 조합
│   │   └── index.ts
│   ├── recipe-detail/
│   │   ├── ui/
│   │   │   └── recipe-detail-page.tsx       # RecipeDetail + ReviewList widget 조합
│   │   └── index.ts
│   ├── recipe-form/
│   │   ├── ui/
│   │   │   └── recipe-form-page.tsx         # RecipeForm widget 조합 (mode prop)
│   │   └── index.ts
│   └── ingredient/
│       ├── ui/
│       │   └── ingredient-page.tsx          # IngredientList widget 조합
│       └── index.ts
│
├── widgets/
│   ├── login-form/
│   │   ├── ui/
│   │   │   ├── login-form.tsx               # 이메일 입력 + OTP 2-step 컨테이너
│   │   │   ├── email-step.tsx               # 이메일 입력 step
│   │   │   └── otp-step.tsx                 # OTP 코드 입력 step
│   │   └── index.ts
│   ├── recipe-grid/
│   │   ├── ui/
│   │   │   ├── recipe-grid.tsx              # 카드 그리드 + 무한스크롤
│   │   │   ├── recipe-card.tsx              # 개별 카드
│   │   │   └── recipe-search-bar.tsx        # 검색 + 정렬
│   │   └── index.ts
│   ├── recipe-detail/
│   │   ├── ui/
│   │   │   ├── recipe-detail.tsx            # 레시피 정보 섹션
│   │   │   └── photo-gallery.tsx            # 사진 갤러리 (최대 2장)
│   │   └── index.ts
│   ├── recipe-form/
│   │   ├── ui/
│   │   │   ├── recipe-form.tsx              # 멀티섹션 폼 컨테이너
│   │   │   ├── basic-info-section.tsx       # 메뉴명, 출처
│   │   │   ├── ingredients-section.tsx      # 재료 동적 리스트
│   │   │   ├── steps-section.tsx            # 오븐온도, 굽는시간, 분량, 스텝
│   │   │   ├── photo-section.tsx            # 사진 업로드 (PhotoUploader feature)
│   │   │   └── review-section.tsx           # 회고 입력 (선택)
│   │   ├── model/
│   │   │   └── recipe-schema.ts             # zod RecipeSchema
│   │   └── index.ts
│   ├── review-list/
│   │   ├── ui/
│   │   │   ├── review-list.tsx              # 회고 리스트 (최신순)
│   │   │   ├── review-card.tsx              # 회고 카드 + RadarChart
│   │   │   └── review-form.tsx              # 회고 추가/수정 폼
│   │   ├── model/
│   │   │   └── review-schema.ts             # zod ReviewSchema
│   │   └── index.ts
│   └── ingredient-list/
│       ├── ui/
│       │   ├── ingredient-list.tsx          # 카드/테이블 뷰 토글 컨테이너
│       │   ├── ingredient-card-view.tsx
│       │   ├── ingredient-table-view.tsx
│       │   └── ingredient-review-form.tsx
│       ├── model/
│       │   └── ingredient-review-schema.ts  # zod IngredientReviewSchema
│       └── index.ts
│
├── features/
│   ├── auth/
│   │   ├── model/
│   │   │   └── auth-store.ts                # zustand authStore
│   │   └── index.ts
│   ├── recipe-delete/
│   │   ├── ui/
│   │   │   └── delete-dialog.tsx            # 삭제 확인 다이얼로그
│   │   └── index.ts
│   └── photo-upload/
│       ├── ui/
│       │   └── photo-uploader.tsx           # 드래그앤드롭 + 미리보기 + 썸네일
│       └── index.ts
│
├── entities/
│   ├── recipe/
│   │   ├── api/
│   │   │   ├── use-recipes.ts               # 목록 + 무한스크롤 훅
│   │   │   ├── use-recipe.ts                # 단건 훅
│   │   │   └── recipe-api.ts                # Supabase CRUD 함수
│   │   ├── model/
│   │   │   └── types.ts                     # Recipe, RecipeIngredient, RecipePhoto
│   │   └── index.ts
│   ├── review/
│   │   ├── api/
│   │   │   ├── use-reviews.ts
│   │   │   └── review-api.ts
│   │   ├── model/
│   │   │   └── types.ts                     # Review
│   │   └── index.ts
│   └── ingredient/
│       ├── api/
│       │   ├── use-ingredients.ts
│       │   ├── use-ingredient-reviews.ts
│       │   └── ingredient-api.ts
│       ├── model/
│       │   └── types.ts                     # Ingredient, IngredientReview
│       └── index.ts
│
└── shared/
    ├── api/
    │   └── supabase-client.ts               # Supabase 클라이언트 싱글톤
    ├── lib/
    │   └── utils.ts                         # cn() 등
    ├── model/
    │   └── ui-store.ts                      # zustand uiStore (뷰 토글)
    ├── hooks/
    │   └── use-intersection-observer.ts     # 무한스크롤용
    └── ui/
        ├── app-layout.tsx                   # max-width 1024px, 중앙 정렬
        ├── radar-chart.tsx                  # recharts 레이더 차트
        ├── score-picker.tsx                 # 컵케이크 점수 선택 (폼용)
        └── cupcake-score.tsx                # 컵케이크 점수 표시 (읽기용)
```

---

## 3. 라우트 → 페이지 연결 패턴

`routes/` 파일은 오직 `pages/` 슬라이스를 import해서 component로 내보내는 역할만 담당.

```ts
// routes/_auth/index.tsx
import { RecipeListPage } from '@/pages/recipe-list'

export const Route = createFileRoute('/_auth/')({
  component: RecipeListPage,
})
```

```ts
// routes/_auth/recipe/$id_.edit.tsx
import { RecipeFormPage } from '@/pages/recipe-form'

export const Route = createFileRoute('/_auth/recipe/$id_/edit')({
  component: () => <RecipeFormPage mode="edit" />,
})
```

```ts
// routes/login.tsx
import { LoginPage } from '@/pages/login'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
```

---

## 4. 페이지 → 위젯 조합 패턴

`pages/` 컴포넌트는 widget을 조합하는 레이아웃만 담당. 비즈니스 로직 없음.

```tsx
// pages/recipe-list/ui/recipe-list-page.tsx
import { RecipeGrid } from '@/widgets/recipe-grid'

export function RecipeListPage() {
  return (
    <main className="px-4 py-6">
      <RecipeGrid />
    </main>
  )
}
```

```tsx
// pages/recipe-detail/ui/recipe-detail-page.tsx
import { RecipeDetail } from '@/widgets/recipe-detail'
import { ReviewList } from '@/widgets/review-list'
import { RecipeDelete } from '@/features/recipe-delete'

export function RecipeDetailPage() {
  const { id } = Route.useParams()
  return (
    <main className="px-4 py-6 space-y-8">
      <RecipeDetail recipeId={id} />
      <ReviewList recipeId={id} />
      <RecipeDelete recipeId={id} />
    </main>
  )
}
```

```tsx
// pages/recipe-form/ui/recipe-form-page.tsx
import { RecipeForm } from '@/widgets/recipe-form'

interface Props { mode: 'create' | 'edit' }

export function RecipeFormPage({ mode }: Props) {
  const { id } = Route.useParams()
  return (
    <main className="px-4 py-6">
      <RecipeForm mode={mode} recipeId={id} />
    </main>
  )
}
```

```tsx
// pages/ingredient/ui/ingredient-page.tsx
import { IngredientList } from '@/widgets/ingredient-list'

export function IngredientPage() {
  return (
    <main className="px-4 py-6">
      <IngredientList />
    </main>
  )
}
```

```tsx
// pages/login/ui/login-page.tsx
import { LoginForm } from '@/widgets/login-form'

export function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <LoginForm />
    </div>
  )
}
```

---

## 5. 라우터 설계 (TanStack Router)

```
routes/
├── __root.tsx          # auth context 주입
├── login.tsx           # LoginPage
├── _auth.tsx           # beforeLoad 인증 가드 + AppLayout
└── _auth/
    ├── index.tsx       # RecipeListPage
    ├── recipe/
    │   ├── new.tsx     # RecipeFormPage (mode=create)
    │   ├── $id.tsx     # RecipeDetailPage
    │   └── $id_.edit.tsx  # RecipeFormPage (mode=edit)
    └── ingredients.tsx # IngredientPage
```

```ts
// routes/_auth.tsx
export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (!context.auth.session) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})
```

```ts
// app/app.tsx
const router = createRouter({
  routeTree,
  context: { auth: undefined! },
})
```

---

## 6. 상태 관리

### auth-store.ts (`features/auth/model/`)

```ts
interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
}
```

- 앱 시작: `supabase.auth.getSession()` 초기화
- `onAuthStateChange` 구독으로 세션 동기화
- `__root.tsx`에서 context로 router에 주입

### ui-store.ts (`shared/model/`)

```ts
interface UIStore {
  ingredientViewMode: 'card' | 'table'
  setIngredientViewMode: (mode: 'card' | 'table') => void
}
```

---

## 7. entities API 훅 설계

### use-recipes.ts

```ts
// entities/recipe/api/use-recipes.ts
export function useRecipes(search: string, sortBy: 'created_at' | 'total_score') {
  // IntersectionObserver + keyset pagination 무한스크롤
  // 페이지 사이즈: 12
  // cursor: 마지막 항목의 created_at + id (중복 방지)
  //
  // Supabase 쿼리:
  // SELECT * FROM recipes
  //   WHERE (user_id = auth.uid() OR is_public = true)
  //   AND name ILIKE '%search%'
  //   AND (created_at, id) < (cursor_created_at, cursor_id)  -- keyset
  //   ORDER BY created_at DESC, id DESC
  //   LIMIT 12
  //
  // hasNextPage: 응답 개수 === 12
  // IntersectionObserver → 마지막 카드 진입 시 다음 페이지 fetch
}
```

### use-recipe.ts

```ts
export function useRecipe(id: string) {
  // SELECT recipes + recipe_ingredients + recipe_photos WHERE id = :id
}
```

### use-reviews.ts

```ts
export function useReviews(recipeId: string) {
  // SELECT reviews WHERE recipe_id = :id ORDER BY created_at DESC
}
```

### use-ingredients.ts / use-ingredient-reviews.ts

```ts
export function useIngredients() { /* WHERE user_id = auth.uid() */ }
export function useIngredientReviews(ingredientId: string) { /* ... */ }
```

---

## 8. 폼 스키마 (zod)

### recipe-schema.ts (`widgets/recipe-form/model/`)

```ts
export const RecipeSchema = z.object({
  name: z.string().min(1, '메뉴명을 입력해주세요'),
  source_type: z.enum(['youtube', 'blog', 'book', 'etc']),
  source_url: z.string().optional(),
  oven_temp: z.string().optional(),
  bake_time: z.string().optional(),
  quantity: z.string().optional(),
  steps: z.string().optional(),
  memo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().optional(),
  })).min(1, '재료를 1개 이상 입력해주세요'),
  photos: z.array(z.instanceof(File)).max(2, '사진은 최대 2장까지 가능합니다'),
})
```

### review-schema.ts (`widgets/review-list/model/`)

```ts
export const ReviewSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요'),
  total_score: z.number().min(1).max(5),
  taste: z.number().min(1).max(5),
  storability: z.number().min(1).max(5),
  recipe_simplicity: z.number().min(1).max(5),
  ingredient_availability: z.number().min(1).max(5),
  texture: z.number().min(1).max(5),
  comment: z.string().optional(),
  storage_memo: z.string().optional(),
})
```

### ingredient-review-schema.ts (`widgets/ingredient-list/model/`)

```ts
export const IngredientReviewSchema = z.object({
  ingredient_name: z.string().min(1, '재료명을 입력해주세요'),
  purchase_place: z.string().optional(),
  score: z.number().min(1).max(5),
  memo: z.string().optional(),
})
```

---

## 9. 주요 컴포넌트 설계

### recipe-form.tsx (`widgets/recipe-form/ui/`)

- `react-hook-form` + `zodResolver(RecipeSchema)`
- 섹션별 앵커: `id="section-basic"`, `"section-ingredients"`, `"section-steps"`, `"section-photos"`, `"section-review"`
- 에러 시 `scrollIntoView({ behavior: 'smooth' })` 자동 스크롤
- `isSubmitting` → 저장 버튼 로딩 스피너
- 성공/실패 → `sonner` toast

```
[① 기본정보] ─── [② 재료] ─── [③ 만드는 법] ─── [④ 사진] ─── [⑤ 회고(선택)]
  섹션 구분선 + 번호 헤더로 시각적 분리
```

### ingredients-section.tsx

- `useFieldArray` (react-hook-form)
- 재료 추가: "+ 재료 추가" 버튼
- 재료 삭제: 행 우측 X 버튼
- 추가/삭제 시 CSS transition 애니메이션

### photo-uploader.tsx (`features/photo-upload/ui/`)

```
┌──────────────────────────────┐
│  드래그하거나 클릭하여 업로드    │
│  최대 2장 · 장당 5MB           │
└──────────────────────────────┘
[미리보기1 ★]  [미리보기2]
  ★ = 썸네일 지정 (클릭으로 토글)
```

- 2장 초과 시 sonner toast 에러
- 5MB 초과 시 sonner toast 에러

### radar-chart.tsx (`shared/ui/`)

```tsx
<RadarChart width={280} height={280} data={radarData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="axis" />
  <Radar dataKey="value" fillOpacity={0.4} />
</RadarChart>
// radarData: [{ axis: '맛', value: 4 }, { axis: '보관 용이성', value: 3 }, ...]
// 모바일: width={240} height={240}
```

### score-picker.tsx / cupcake-score.tsx (`shared/ui/`)

```tsx
<ScorePicker value={score} onChange={setScore} />   // 폼 입력용
<CupcakeScore value={4} />                          // 읽기 전용 표시
// 1~5 컵케이크 아이콘, 채워짐/빈 상태로 구분
```

---

## 10. 인증 플로우

```
[email-step] → signInWithOtp({ email })
      ↓
[otp-step] → verifyOtp({ email, token, type: 'email' })
      ↓
setSession → router.navigate({ to: '/' })

Remember me ON  → Supabase 기본 (localStorage 세션 유지)
Remember me OFF → Supabase 클라이언트 auth.storage를 sessionStorage로 교체

// shared/api/supabase-client.ts
export function createSupabaseClient(rememberMe: boolean) {
  return createClient(url, key, {
    auth: {
      storage: rememberMe ? localStorage : sessionStorage,
      persistSession: true,
    },
  })
}
// features/auth에서 로그인 시 rememberMe 값으로 클라이언트 생성
// sessionStorage → 탭/브라우저 종료 시 세션 만료 (PRD 정책과 일치)
```

- OTP 재전송: otp-step.tsx 로컬 state로 관리
  - `const [countdown, setCountdown] = useState(60)`
  - `useEffect`로 1초마다 감소, 0 도달 시 재전송 버튼 활성화
  - 재전송 클릭 → signInWithOtp 재호출 → countdown 60 리셋
  - 재전송 실패 시 sonner toast 에러

---

## 11. 사진 업로드 플로우

```
File 선택/드롭
  → 클라이언트 검증 (2장 이하, 5MB 이하)
  → FileReader → 미리보기 base64
  → 폼 저장 시:
      1. recipes INSERT → recipe_id 획득
      2. Storage upload: recipe-photos/{user_id}/{recipe_id}/{uuid}.{ext}
      3. recipe_photos INSERT (storage_path, order)
      4. recipes UPDATE SET thumbnail_photo_id
```

---

## 12. TailwindCSS v4 테마

> ⚠️ **Deprecated** — 아래 값은 시안 확정 이전의 구 값입니다. 실제 구현 시 **Section 18-2, 18-3**의 확정 토큰을 사용하세요.

```css
/* ❌ 구 값 (참고용, 사용 금지) */
/* --color-accent: oklch(40% 0.10 25);  → #8B3A2A (Step 1 구버전) */
/* --color-primary: oklch(88% 0.03 65); → #E8DFD0 (구버전) */

/* ✅ 확정 값은 Section 18-2 tokens.css, Section 18-3 @theme 블록 참조 */
```

- 다크모드: `[data-theme="dark"]` 속성 기반 (Section 18-2 참조)
- shadcn 컬러 토큰 override: Section 18-6 참조

---

## 17. 디자인 시스템 확정 (Step 1~4)

### 폰트

| 항목 | 값 |
|------|-----|
| 폰트 패밀리 | **Pretendard** 단일 통일 |
| CDN | `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css` |
| 적용 방식 | `index.html` `<link>` + CSS `--font-sans` 변수 |

### Step 1: 레시피 목록 (`/`) — 확정

**컨셉**: Notebook & Kraft Paper — 실물 베이킹 노트 디지털화, 아날로그 감성

| 항목 | 명세 |
|------|------|
| 배경 | 라이트 #E8DFD0(크라프트) / 다크 #1C1610 |
| 카드 | Polaroid 스타일 (흰 테두리 + 아래 여백), 오프화이트 #F2EBE0 |
| 날짜 | 스탬프 배지 (테두리형, 기울어진 텍스트) |
| 출처 배지 | 씰/도장 스타일 (테두리만) |
| 점수 | 🧁 이모지 1~5개 |
| 그리드 | 모바일 1열 / 태블릿 2열 |
| 검색바 | 룰드라인 노트 스타일 (연필 아이콘) |
| FAB | 레드브라운 배경 (#8B3A2A) |

### 인터랙션 가이드 (구현 시 반영)

shadcn/ui 기반 컴포넌트로 구현하되 아래 인터랙션을 추가로 적용한다.

| 요소 | 인터랙션 |
|------|---------|
| 카드 hover | `translateY(-4px)` + box-shadow 강조 + 메뉴명 액센트 컬러 전환 (150ms ease) |
| 카드 로드 | stagger fade-in + slide-up (0.06s 간격, `animation-delay`) |
| 검색 입력 | 220ms 디바운스, 결과 없을 때 empty state 애니메이션 |
| 더 보기 버튼 | 클릭 시 스피너 → 카드 stagger 추가 렌더 |
| FAB | hover 시 `rotate(45deg)` + scale 1.1 (120ms) |
| 다크모드 토글 | 아이콘 rotate 애니메이션 (200ms) |
| 출처 배지 | hover 시 배경 fill (테두리→채움 전환) |
| 정렬 변경 | 카드 목록 fade-out → re-sort → fade-in |

---

## 13. Supabase 설정

### Storage 버킷

```
버킷명: recipe-photos
공개:   false (Signed URL)
경로:   {user_id}/{recipe_id}/{uuid}.{ext}
```

### RLS 주요 정책

```sql
-- recipes
CREATE POLICY "select" ON recipes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "insert" ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update" ON recipes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "delete" ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- 나머지 테이블: user_id = auth.uid() 단순 정책
```

---

## 14. 개발환경 설정

### eslint

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
```

```ts
// eslint.config.ts
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  { ignores: ['dist/', 'src/routeTree.gen.ts'] },  // TanStack Router 자동생성 파일 제외
)
```

### prettier

```bash
npm install -D prettier eslint-config-prettier
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

```
# .prettierignore
dist/
src/routeTree.gen.ts
```

### husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### commitlint

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```ts
// commitlint.config.ts
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'design', 'refactor',
      'chore', 'docs', 'test', 'revert',
    ]],
    'subject-max-length': [2, 'always', 72],
  },
}
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

**커밋 타입 예시**
```
feat: 레시피 추가 폼 구현
fix: OTP 재전송 타이머 버그 수정
design: 레시피 카드 레이아웃 조정
chore: 패키지 버전 업데이트
```

---

## 15. 의존성 설치

```bash
# 프로젝트 생성
npm create vite@latest 8ake -- --template react-ts

# 스타일링
npm install -D tailwindcss @tailwindcss/vite

# UI
npx shadcn@latest init           # Tailwind v4 옵션 선택 (shadcn-ui는 deprecated)
npm install lucide-react sonner

# 라우터
npm install @tanstack/react-router
npm install -D @tanstack/router-vite-plugin @tanstack/router-devtools

# 상태/폼
npm install zustand react-hook-form zod @hookform/resolvers

# 차트
npm install recharts

# 백엔드
npm install @supabase/supabase-js

# 개발환경
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

---

## 16. path alias 설정

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

각 슬라이스 import 예시:
```ts
import { RecipeGrid }   from '@/widgets/recipe-grid'
import { useRecipes }   from '@/entities/recipe'
import { AuthStore }    from '@/features/auth'
import { supabase }     from '@/shared/api/supabase-client'
```

---

## 18. 공통 디자인 토큰 & shadcn/ui 통합 계획

> Step 1~4 시안 전수 분석 기반. 실제 구현 시 이 계획을 기준으로 적용.

---

### 18-1. 핵심 원칙

| 원칙 | 내용 |
|------|------|
| **단일 토큰 소스** | `src/shared/styles/tokens.css` 한 곳에서 모든 CSS 변수 관리 |
| **shadcn/ui 우선** | shadcn 변수(`--background`, `--primary` 등)를 8ake 토큰으로 매핑 |
| **이모지 → lucide-react** | 시안의 이모지 아이콘을 모두 lucide-react 컴포넌트로 대체 |
| **컴포넌트 재사용** | 4개 페이지 공통 요소(헤더, 카드, 버튼, 인풋)를 `shared/ui`에 단일 구현 |
| **파일명 규칙** | 모든 파일명 kebab-case (`app-header.tsx`, `note-card.tsx`) |

---

### 18-2. 확정 디자인 토큰

시안 간 불일치를 해소한 최종 값. Step 2~4 기준으로 Step 1 흡수.

#### CSS 변수 (`src/shared/styles/tokens.css`)

```css
@layer base {
  :root {
    /* ── 배경 ── */
    --background:        #F5EDE0;   /* --bg */
    --card:              #FEFAF4;   /* --card-bg */
    --surface:           #EDE3D6;   /* 인풋/surface 영역 */

    /* ── 텍스트 ── */
    --foreground:        #1E1410;   /* --text */
    --muted-foreground:  #8C7B6B;   /* --text-muted */

    /* ── 액센트 (primary) ── */
    --primary:           #C2673A;   /* --accent */
    --primary-foreground: #FFFFFF;
    --primary-dim:       rgba(194, 103, 58, 0.10);  /* --accent-dim */
    --primary-border:    rgba(194, 103, 58, 0.40);  /* --accent-border */

    /* ── 테두리 / 구분선 ── */
    --border:            rgba(194, 103, 58, 0.14);
    --rule:              rgba(194, 103, 58, 0.08);   /* 배경 줄선 */

    /* ── 그림자 ── */
    --shadow:            0 4px 20px rgba(100, 50, 20, 0.08);
    --shadow-card:       0 2px 12px rgba(100, 50, 20, 0.06);

    /* ── 반경 ── */
    --radius:            12px;
    --radius-sm:         8px;
    --radius-xs:         6px;

    /* ── 레이아웃 ── */
    --header-h:          56px;
    --transition:        0.25s cubic-bezier(.4, 0, .2, 1);

    /* ── 에러 ── */
    --destructive:       #C0392B;
    --destructive-foreground: rgba(192, 57, 43, 0.07);

    /* ── 노이즈 텍스처 투명도 ── */
    --noise-opacity:     0.04;
  }

  [data-theme="dark"] {
    --background:        #17120D;
    --card:              #221C15;
    --surface:           #1C1610;

    --foreground:        #F0E6D8;
    --muted-foreground:  #9E8E7E;

    --primary:           #E07B4A;
    --primary-dim:       rgba(224, 123, 74, 0.15);
    --primary-border:    rgba(224, 123, 74, 0.45);

    --border:            rgba(224, 123, 74, 0.16);
    --rule:              rgba(224, 123, 74, 0.06);

    --shadow:            0 4px 24px rgba(0, 0, 0, 0.50);
    --shadow-card:       0 2px 12px rgba(0, 0, 0, 0.30);

    --destructive:       #E05C4A;
    --destructive-foreground: rgba(224, 92, 74, 0.10);

    --noise-opacity:     0.06;
  }
}
```

#### shadcn/ui 변수 매핑 (`src/shared/styles/shadcn-theme.css`)

shadcn는 HSL 기반 변수를 사용. 8ake 토큰을 shadcn 네이밍으로 연결.

```css
@layer base {
  :root {
    --background:         36 54% 90%;   /* #F5EDE0 */
    --foreground:         20 56% 10%;   /* #1E1410 */
    --card:               36 78% 97%;   /* #FEFAF4 */
    --card-foreground:    20 56% 10%;
    --popover:            36 78% 97%;
    --popover-foreground: 20 56% 10%;
    --primary:            20 58% 49%;   /* #C2673A */
    --primary-foreground: 0 0% 100%;
    --secondary:          30 35% 88%;   /* --surface #EDE3D6 */
    --secondary-foreground: 20 56% 10%;
    --muted:              30 35% 88%;
    --muted-foreground:   25 18% 49%;   /* #8C7B6B */
    --accent:             20 58% 49%;
    --accent-foreground:  0 0% 100%;
    --destructive:        5 65% 47%;    /* #C0392B */
    --destructive-foreground: 0 0% 100%;
    --border:             20 58% 49%;   /* accent 기반, opacity는 CSS로 처리 */
    --input:              30 35% 88%;
    --ring:               20 58% 49%;
    --radius:             0.75rem;      /* 12px */
  }

  .dark {
    --background:         20 32% 7%;    /* #17120D */
    --foreground:         30 50% 91%;   /* #F0E6D8 */
    --card:               20 27% 11%;   /* #221C15 */
    --card-foreground:    30 50% 91%;
    --popover:            20 27% 11%;
    --popover-foreground: 30 50% 91%;
    --primary:            20 73% 61%;   /* #E07B4A */
    --primary-foreground: 0 0% 100%;
    --secondary:          20 25% 9%;
    --secondary-foreground: 30 50% 91%;
    --muted:              20 25% 9%;
    --muted-foreground:   25 12% 56%;   /* #9E8E7E */
    --accent:             20 73% 61%;
    --accent-foreground:  0 0% 100%;
    --destructive:        8 72% 60%;
    --destructive-foreground: 0 0% 100%;
    --border:             20 73% 61%;
    --input:              20 25% 9%;
    --ring:               20 73% 61%;
  }
}
```

---

### 18-3. TailwindCSS v4 `@theme` 확장

```css
/* src/shared/styles/tailwind-theme.css */
@import "tailwindcss";

@theme {
  /* 컬러 */
  --color-background:        var(--background);
  --color-foreground:        var(--foreground);
  --color-card:              var(--card);
  --color-surface:           var(--surface);
  --color-primary:           hsl(var(--primary));
  --color-primary-dim:       var(--primary-dim);
  --color-muted-foreground:  hsl(var(--muted-foreground));
  --color-border:            var(--border);
  --color-destructive:       hsl(var(--destructive));

  /* 반경 */
  --radius-sm:   var(--radius-sm);   /* 8px */
  --radius-md:   var(--radius);      /* 12px */
  --radius-xs:   var(--radius-xs);   /* 6px */

  /* 그림자 */
  --shadow-card: var(--shadow-card);
  --shadow-page: var(--shadow);

  /* 폰트 */
  --font-sans: 'Pretendard', -apple-system, sans-serif;

  /* 트랜지션 */
  --ease-smooth: cubic-bezier(.4, 0, .2, 1);
}
```

---

### 18-4. 공통 컴포넌트 구조 (`src/shared/ui/`)

시안 간 불일치했던 컴포넌트를 단일 구현으로 통일.

```
src/shared/ui/
├── layout/
│   ├── app-header.tsx        # 헤더 (Step 1~4 통합)
│   ├── page-wrapper.tsx      # 최대 너비 래퍼
│   └── bottom-action-bar.tsx # 하단 고정 액션 바 (Step 3)
├── note-card/
│   ├── note-card.tsx         # 기본 카드 래퍼
│   ├── note-card-header.tsx  # 카드 헤더 (border-bottom 포함)
│   └── note-card-body.tsx    # 카드 바디
├── buttons/
│   ├── primary-button.tsx    # accent 배경 버튼
│   ├── ghost-button.tsx      # 투명 테두리 버튼
│   ├── icon-button.tsx       # 36×36 아이콘 버튼
│   └── fab.tsx               # 우하단 플로팅 버튼
├── form/
│   ├── form-input.tsx        # 기본 인풋 (shadcn Input 래핑)
│   ├── form-textarea.tsx     # textarea (ruled 옵션)
│   ├── tag-input.tsx         # 태그 인풋 + 칩
│   ├── slide-toggle.tsx      # 공개/비공개 토글
│   └── cupcake-rating.tsx    # lucide Star 평점 선택
├── feedback/
│   ├── empty-state.tsx       # 빈 상태 (검색 결과 없음 등)
│   └── toast.tsx             # sonner 토스트 래핑
└── theme/
    └── theme-toggle.tsx      # 다크/라이트 토글 버튼
```

#### AppHeader 통합 스펙

| 속성 | 확정 값 |
|------|---------|
| height | `56px` (CSS var `--header-h`) |
| position | `sticky` (목록/상세) / `fixed` (폼) — `variant` prop |
| background | `hsl(var(--background)) / 0.85` + `backdrop-filter: blur(12px)` |
| border-bottom | `1px solid var(--border)` |
| z-index | `100` |
| padding | `0 16px` (모바일) / `0 24px` (태블릿+) |

#### NoteCard 확정 스펙

| 속성 | 확정 값 |
|------|---------|
| background | `hsl(var(--card))` |
| border | `1px solid var(--border)` |
| border-radius | `var(--radius)` = 12px |
| box-shadow | `var(--shadow-card)` |
| overflow | `hidden` |
| 카드 헤더 padding | `14px 16px 10px` |
| 카드 헤더 border-bottom | `1px solid var(--border)` |
| 카드 바디 padding | `16px` |

---

### 18-5. 이모지 → lucide-react 아이콘 매핑

시안에서 사용된 이모지를 lucide-react 아이콘으로 전환.

| 용도 | 시안 이모지 | lucide-react |
|------|------------|-------------|
| 레시피 추가 FAB | ✏️ | `<PenLine />` |
| 재료 추가 | ➕ | `<Plus />` |
| 뒤로가기 | ← | `<ChevronLeft />` |
| 삭제 | 🗑️ | `<Trash2 />` |
| 수정/편집 | ✏️ | `<Pencil />` |
| 검색 | 🔍 | `<Search />` |
| 출처 YouTube | 🎬 | `<Youtube />` |
| 출처 블로그 | 📝 | `<FileText />` |
| 출처 책 | 📚 | `<BookOpen />` |
| 출처 기타 | ✏️ | `<PenLine />` |
| 외부 링크 | ↗ | `<ExternalLink />` |
| 공개 | 🌐 | `<Globe />` |
| 비공개 | 🔒 | `<Lock />` |
| 사진 업로드 | 📷 | `<Camera />` |
| 태그 | # | `<Hash />` |
| 정렬 | — | `<ArrowUpDown />` |
| 카드 뷰 | ⊞ | `<LayoutGrid />` |
| 테이블 뷰 | ☰ | `<List />` |
| 드래그 핸들 | ⠿ | `<GripVertical />` |
| 테마 라이트 | ☀️ | `<Sun />` |
| 테마 다크 | 🌙 | `<Moon />` |
| 닫기 | × | `<X />` |
| 저장 | 💾 | `<Save />` |
| 재료 등록 수 | 📦 | `<Package />` |
| 평균 평점 | ⭐ | `<Star />` |
| 최고 재료 | 🏆 | `<Trophy />` |
| 오븐 온도 | 🌡️ | `<Thermometer />` |
| 굽는 시간 | ⏱️ | `<Timer />` |
| 분량 | 🍪 | `<Cookie />` |
| 종합 점수 (컵케이크) | 🧁 | `<Star />` (filled) |

#### CupcakeRating 구현 방향
```tsx
// shadcn 기본 없음 → 커스텀 컴포넌트
import { Star } from 'lucide-react'

// filled: fill="currentColor", empty: fill="none"
<Star size={18} fill={i < score ? "currentColor" : "none"} />
```

---

### 18-6. shadcn/ui 컴포넌트 활용 계획

> **버전 기준**: shadcn/ui (Tailwind v4, new-york 스타일)
> **특이사항**: Tailwind v4는 CSS-first 방식 — `tailwind.config.js` 없이 `@import "tailwindcss"` + `@theme {}` 사용
> `tw-animate-css` 사용 (`tailwindcss-animate` 대신), OKLCH 색상 체계, `forwardRef` 제거됨

#### 경로 구분

| 경로 | 역할 |
|------|------|
| `src/components/ui/` | `npx shadcn add`로 **자동 생성**되는 shadcn 원본 파일 (직접 수정 금지) |
| `src/shared/ui/` | shadcn 컴포넌트를 **래핑/커스터마이징**한 8ake 전용 컴포넌트 |

```tsx
// 예시: src/shared/ui/form/form-input.tsx
import { Input } from '@/components/ui/input'   // shadcn 원본 import

export function FormInput({ ... }) {
  return <Input className="bg-[var(--surface)] focus-visible:ring-[var(--primary)] ..." />
}
```

#### 일괄 설치 명령어

```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea select dialog drawer tabs switch slider badge tooltip sonner
```

#### 컴포넌트별 상세

| 기능 | shadcn 컴포넌트 | import 경로 (shadcn 원본) | 주요 props | 커스터마이징 |
|------|----------------|--------------------------|-----------|-------------|
| 기본 인풋 | `Input` | `@/components/ui/input` | `type`, `placeholder`, `disabled` | surface 배경, accent focus ring |
| 텍스트에어리어 | `Textarea` | `@/components/ui/textarea` | `rows`, `placeholder` | ruled line 옵션 |
| 버튼 | `Button` | `@/components/ui/button` | `variant` (`default\|ghost\|outline\|destructive`), `size` (`sm\|default\|lg\|icon`) | accent 색 적용 |
| 드롭다운/정렬 | `Select` | `@/components/ui/select` | `SelectTrigger`, `SelectContent`, `SelectItem` | 커스텀 트리거 스타일 |
| 모달 | `Dialog` | `@/components/ui/dialog` | `DialogContent`, `DialogHeader`, `DialogTitle`, `open`, `onOpenChange` | 재료 추가/수정 폼 |
| 바텀 시트 | `Drawer` | `@/components/ui/drawer` | `DrawerContent`, `DrawerHeader`, `direction` | 모바일 상세 패널 (vaul 기반) |
| 탭 | `Tabs` | `@/components/ui/tabs` | `defaultValue`, `TabsList`, `TabsTrigger`, `TabsContent` | 레시피/베이킹기록 탭 |
| 토스트 | `Sonner` | `sonner` (외부 패키지) | `toast()`, `toast.success()`, `toast.error()` | 저장 성공/실패 |
| 툴팁 | `Tooltip` | `@/components/ui/tooltip` | `TooltipProvider`, `TooltipTrigger`, `TooltipContent` | 아이콘 버튼 레이블 |
| 스위치 | `Switch` | `@/components/ui/switch` | `checked`, `onCheckedChange`, `disabled` | 공개/비공개 토글 |
| 슬라이더 | `Slider` | `@/components/ui/slider` | `min`, `max`, `step`, `value`, `onValueChange` | 세부 평가 5축 (0~5) |
| 뱃지 | `Badge` | `@/components/ui/badge` | `variant` (`default\|secondary\|outline\|destructive`) | 태그, 공개/비공개, 썸네일 |

#### Tailwind v4 특이사항

```css
/* ❌ tailwind.config.js (v3 방식) — 사용 안 함 */

/* ✅ v4 방식: src/app/index.css */
@import "tailwindcss";
@import "tw-animate-css";          /* tailwindcss-animate 대신 */
@import "../shared/styles/tokens.css";

@custom-variant dark (&:is(.dark *));  /* dark mode */

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
}
```

#### shadcn 색상 오버라이드 (OKLCH → 8ake 토큰 매핑)

shadcn v4 init 시 생성되는 기본 OKLCH 색상을 8ake 토큰으로 덮어씀:

```css
/* src/app/index.css — shadcn init 후 수동 수정 */
@layer base {
  :root {
    --background: 36 54% 90%;    /* #F5EDE0 */
    --primary: 20 58% 49%;       /* #C2673A */
    --radius: 0.75rem;
    /* 나머지 토큰은 18-2 참조 */
  }
}
```

---

### 18-7. 배경 텍스처 공통화

모든 페이지에 동일하게 적용. `AppLayout`에서 한 번만 선언.

```css
/* 노이즈 텍스처 */
.app-noise::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,..."); /* feTurbulence */
  opacity: var(--noise-opacity);
}

/* 노트 줄선 */
.app-noise::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    var(--rule) 27px,
    var(--rule) 28px
  );
}
```

---

### 18-8. 반응형 브레이크포인트 확정

| 이름 | 값 | 용도 |
|------|-----|------|
| `sm` | 480px | 진행 바 레이블 숨김 |
| `md` | 768px | 2열 그리드, 사이드 패널 활성화 |
| `lg` | 1024px | 최대 너비 720px 제한 (폼), 탭 2열 |

---

### 18-9. 구현 우선순위

```
Phase 1 — 기반 세팅
  ① tokens.css + shadcn-theme.css 작성
  ② tailwind.config 연결
  ③ Pretendard 폰트 설정

Phase 2 — 공통 컴포넌트 (shared/ui)
  ④ app-header.tsx (sticky/fixed variant)
  ⑤ note-card.tsx + note-card-header.tsx + note-card-body.tsx
  ⑥ theme-toggle.tsx (Sun/Moon lucide)
  ⑦ primary-button.tsx / ghost-button.tsx / icon-button.tsx / fab.tsx
  ⑧ form-input.tsx / form-textarea.tsx (shadcn 래핑)
  ⑨ cupcake-rating.tsx (Star lucide 커스텀)
  ⑩ empty-state.tsx

Phase 3 — 페이지별 구현 (Step 순서대로)
  ⑪ Step 1 레시피 목록 위젯
  ⑫ Step 2 레시피 상세 + 탭
  ⑬ Step 3 레시피 폼 (진행 바 + 멀티섹션)
  ⑭ Step 4 재료 리뷰 (테이블 + 서머리 바)
```
