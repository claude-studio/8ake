# FSD 레이어 상세 및 위반 패턴

## 레이어별 허용/금지 import 패턴

### routes/ (레이어 1)
```tsx
// ✅ 허용
import { RecipeListPage } from '@/pages/recipe-list'
export const Route = createFileRoute('/_auth/')({ component: RecipeListPage })

// ❌ 금지 — 로직 포함
import { useRecipes } from '@/entities/recipe'
export const Route = createFileRoute('/_auth/')({
  component: () => {
    const recipes = useRecipes() // 금지!
    return <div>{...}</div>
  }
})
```

### pages/ (레이어 2)
```tsx
// ✅ 허용 — widget 조합만
export function RecipeListPage() {
  return (
    <PageWrapper>
      <RecipeGrid />
      <FAB />
    </PageWrapper>
  )
}

// ❌ 금지 — API 훅 직접 호출
export function RecipeListPage() {
  const { recipes } = useRecipes() // 금지! entities를 pages에서 직접 호출
  return <RecipeGrid recipes={recipes} />
}
```

### widgets/ (레이어 3)
```tsx
// ✅ 허용
import { RecipeCard } from '@/entities/recipe'
import { DeleteRecipe } from '@/features/recipe-delete'

// ❌ 금지 — 다른 widget import
import { ReviewList } from '@/widgets/review-list' // widget→widget 금지
```

### shared/ (레이어 6)
```tsx
// ✅ 허용
import { cn } from '@/shared/lib/utils'
import { supabase } from '@/shared/api/supabase-client'

// ❌ 금지 — shadcn 원본 직접 수정 금지
// src/components/ui/button.tsx 수정하지 말 것
// src/shared/ui/에서 래핑하여 사용
```

## 자주 발생하는 위반 유형

| 유형 | 예시 | 수정 방법 |
|------|------|----------|
| 같은 레이어 참조 | `widgets/A` → `widgets/B` | B를 `entities`나 `features`로 내려서 공유 |
| 역방향 참조 | `entities` → `features` | 공통 로직을 `shared`로 이동 |
| Public API 우회 | `@/entities/recipe/ui/recipe-card` | `@/entities/recipe`로 변경 |
| routes 역할 초과 | routes에서 `useState` 사용 | pages 또는 widget으로 이동 |
| pages 역할 초과 | pages에서 API 훅 호출 | widget으로 이동 |
| shadcn 직접 수정 | `src/components/ui/button.tsx` 편집 | `src/shared/ui/`에서 래핑 컴포넌트 작성 |

## import 경로 → 레이어 번호 매핑

```
@/app/        → 0 (app)
@/routes/     → 1 (routes)
@/pages/      → 2 (pages)
@/widgets/    → 3 (widgets)
@/features/   → 4 (features)
@/entities/   → 5 (entities)
@/shared/     → 6 (shared)
@/components/ui/ → 6 (shadcn, shared 레이어로 취급)
```
