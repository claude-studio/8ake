---
name: create-slice
description: 'FSD 슬라이스 보일러플레이트를 자동 생성. 사용법: /create-slice <layer> <name> — 예: /create-slice entities recipe, /create-slice features recipe-delete. 지정한 레이어에 ui/, model/, api/ 폴더와 index.ts를 생성하고 8ake 컨벤션에 맞는 초기 코드를 채운다.'
context: fork
argument-hint: '<layer> <name>'
user-invocable: true
---

# FSD 슬라이스 생성

인자에서 `<layer>`와 `<name>`을 파싱하세요. 없으면 사용법을 안내하세요.

```
사용법: /create-slice <layer> <name>
예시:   /create-slice entities recipe
        /create-slice features recipe-delete
        /create-slice widgets recipe-grid
```

## 생성 규칙

- 파일명: **kebab-case** 필수
- export: **named export only** (default 금지)
- import alias: `@/` 사용
- 레이어에 따라 생성할 세그먼트가 다름 (아래 참조)

## 레이어별 생성 구조

### entities/`<name>`

```
src/entities/<name>/
├── ui/
│   └── <name>-card.tsx       # 기본 표시 컴포넌트
├── model/
│   └── <name>.types.ts       # 타입 + zod 스키마
├── api/
│   └── use-<name>s.ts        # 데이터 패칭 커스텀 훅
└── index.ts                  # public API
```

**`<name>.types.ts` 템플릿:**

```ts
import { z } from 'zod'

export const <Name>Schema = z.object({
  id: z.string().uuid(),
  // TODO: 필드 추가
})

export type <Name> = z.infer<typeof <Name>Schema>
```

**`use-<name>s.ts` 템플릿:**

```ts
import { useState, useEffect } from 'react'
import { supabase } from '@/shared/api/supabase-client'
import type { <Name> } from '../model/<name>.types'

export function use<Names>() {
  const [data, setData] = useState<<Name>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('<name>s')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setData(data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
```

**`<name>-card.tsx` 템플릿:**

```tsx
import type { <Name> } from '../model/<name>.types'

interface <Name>CardProps {
  <name>: <Name>
}

export function <Name>Card({ <name> }: <Name>CardProps) {
  return (
    <div className="...">
      {/* TODO: 구현 */}
    </div>
  )
}
```

**`index.ts` 템플릿:**

```ts
export { <Name>Card } from './ui/<name>-card'
export { use<Names> } from './api/use-<name>s'
export type { <Name> } from './model/<name>.types'
export { <Name>Schema } from './model/<name>.types'
```

---

### features/`<name>`

```
src/features/<name>/
├── ui/
│   └── <name>.tsx            # 인터랙션 컴포넌트
├── model/
│   └── <name>.schema.ts      # form 스키마 (필요 시)
├── api/
│   └── use-<name>.ts         # mutation 훅 (필요 시)
└── index.ts                  # public API
```

**`<name>.tsx` 템플릿:**

```tsx
// TODO: 구현
export function <Name>() {
  return <div />
}
```

**`index.ts` 템플릿:**

```ts
export { <Name> } from './ui/<name>'
```

---

### widgets/`<name>`

```
src/widgets/<name>/
├── ui/
│   └── <name>.tsx            # 독립 UI 블록
└── index.ts                  # public API
```

**`<name>.tsx` 템플릿:**

```tsx
export function <Name>() {
  return (
    <section>
      {/* TODO: entities/features 조합 */}
    </section>
  )
}
```

**`index.ts` 템플릿:**

```ts
export { <Name> } from './ui/<name>'
```

---

### pages/`<name>`

```
src/pages/<name>/
├── ui/
│   └── <name>-page.tsx       # widget 조합만
└── index.ts
```

**`<name>-page.tsx` 템플릿:**

```tsx
export function <Name>Page() {
  return (
    <div>
      {/* TODO: widgets 조합 */}
    </div>
  )
}
```

---

## 이름 변환 규칙

`<name>`이 `recipe-delete`처럼 kebab-case인 경우:

- 파일명 → `recipe-delete.tsx`
- PascalCase 변환 → `RecipeDelete`
- camelCase 변환 → `recipeDelete`
- 복수형 훅명 → `useRecipeDeletes` (단, 의미상 어색하면 `useRecipeDelete`로)

## 생성 후 안내

생성된 파일 목록을 출력하고 다음을 안내하세요:

1. `index.ts`에서 export가 필요한 항목을 확인하세요
2. 타입/스키마는 `docs/02-design/features/ui.design.md`의 스키마 섹션을 참조하세요
3. Supabase 테이블명을 실제 스키마에 맞게 수정하세요
