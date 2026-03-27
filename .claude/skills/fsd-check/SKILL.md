---
name: fsd-check
description: "FSD 아키텍처 규칙 위반을 전체 src/ 코드베이스에서 검사. /fsd-check 명령 시 레이어 의존성 방향, public API 우회, routes/pages 역할 초과, kebab-case 파일명을 전수 검사하여 위반 리포트를 출력. 코드 구현 중 의심스러운 import가 있거나, 리팩토링 전후, PR 전 최종 확인 시 사용."
context: fork
agent: Explore
user-invocable: true
---

# FSD 전수 검사

`src/` 하위 전체 파일을 순서대로 검사하고 위반 사항을 리포트로 출력하세요.

## 레이어 번호 매핑

```
@/app/        → 0 (app)
@/routes/     → 1 (routes)
@/pages/      → 2 (pages)
@/widgets/    → 3 (widgets)
@/features/   → 4 (features)
@/entities/   → 5 (entities)
@/shared/     → 6 (shared)
@/components/ui/ → 6 (shadcn, shared 취급)
```

## 검사 항목 (4가지)

### 1. 레이어 의존성 방향

각 `.ts` / `.tsx` 파일의 `@/` import를 추출해 다음을 확인:
- **같은 레이어 참조**: `src_layer === imp_layer` (단, shared → shared는 허용)
- **역방향 참조**: `src_layer > imp_layer` (하위가 상위를 참조)

### 2. Public API 우회

슬라이스 외부에서 내부 파일을 직접 import하는 경우:
```
# 위반 패턴 예시
import { X } from '@/entities/recipe/ui/recipe-card'   ← ui/ 직접 참조
import { X } from '@/features/auth/model/auth-store'   ← model/ 직접 참조
import { X } from '@/widgets/header/ui/header'         ← ui/ 직접 참조

# 정상 패턴
import { X } from '@/entities/recipe'                  ← index.ts 경유
```

슬라이스: `@/<layer>/<slice-name>/` 이후에 `ui/`, `model/`, `api/` 세그먼트가 있으면 위반.

### 3. routes/pages 역할 초과

**routes 파일** (`src/routes/` 내):
- `useState`, `useEffect`, `useCallback`, `useMemo` 사용 → 위반
- `fetch(`, `supabase.` 호출 → 위반
- `@/entities/`, `@/features/` import → 위반 (pages를 거치지 않음)

**pages 파일** (`src/pages/` 내):
- `use` 로 시작하는 커스텀 훅 중 `@/entities/` 또는 `@/features/` 에서 가져온 것 → 위반
- `supabase.` 직접 호출 → 위반

### 4. 파일명 kebab-case

`src/` 하위 모든 파일명에서 대문자(`[A-Z]`) 또는 언더스코어(`_`)가 포함된 경우 위반.
예외: `routeTree.gen.ts`, `components.json`

---

## 출력 형식

검사 완료 후 아래 형식으로 리포트를 출력하세요:

```
## FSD 전수 검사 리포트

### 검사 범위
- 파일 수: N개
- 검사 항목: 레이어 의존성, Public API, 역할 초과, 파일명

---

### 위반 사항 (총 N건)

#### 1. 레이어 의존성 위반 (N건)
| 파일 | 위반 import | 유형 |
|------|------------|------|
| src/entities/recipe/api/use-recipes.ts | @/features/auth | 역방향 |

#### 2. Public API 우회 (N건)
| 파일 | 위반 import |
|------|------------|
| src/widgets/header/ui/header.tsx | @/entities/recipe/ui/recipe-card |

#### 3. 역할 초과 (N건)
| 파일 | 위반 내용 |
|------|----------|
| src/routes/_auth/index.tsx | useState 사용 금지 |

#### 4. 파일명 위반 (N건)
| 파일 경로 | 문제 |
|----------|------|
| src/widgets/RecipeCard.tsx | PascalCase → recipe-card.tsx |

---

### 요약
위반 없음 ✅  (또는 총 N건 위반 — 수정 필요)
```

위반이 없으면 "✅ FSD 규칙 위반 없음"만 출력하면 됩니다.
