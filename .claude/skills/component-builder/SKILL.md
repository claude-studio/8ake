---
name: component-builder
description: '8ake 설계 문서와 디자인 시안을 기반으로 FSD 규칙을 준수하는 React 컴포넌트를 자율 구현. 사용법: /component-builder <component-name> — 예: /component-builder recipe-card, /component-builder recipe-form. 설계 문서 확인 → 슬라이스 구조 결정 → 구현 → 토큰/FSD 검증까지 독립적으로 수행.'
context: fork
argument-hint: '<component-name>'
user-invocable: true
skills:
  - fsd-conventions
---

# 컴포넌트 자율 구현

인자에서 `<component-name>`을 추출하세요. 없으면 사용법을 안내하세요.

```
사용법: /component-builder <component-name>
예시:   /component-builder recipe-card
        /component-builder recipe-form
        /component-builder auth-form
        /component-builder recipe-grid
```

## 구현 프로세스

### 1단계: 설계 문서 파악

다음 순서로 문서를 읽어 구현에 필요한 정보를 수집하세요:

1. `docs/02-design/features/ui.design.md` — FSD 구조, 컴포넌트 명세, 스키마
2. `docs/00-pm/ui.prd.md` — 기능 요구사항
3. `docs/design-mockups/` — 관련 HTML 시안 파일 (파일명 추정하여 탐색)
4. `src/shared/styles/tokens.css` — 사용 가능한 디자인 토큰

### 2단계: FSD 레이어 결정

컴포넌트 성격에 따라 적절한 레이어를 선택하세요:

| 성격                                         | 레이어     |
| -------------------------------------------- | ---------- |
| 도메인 데이터 표시 (RecipeCard, RecipeTitle) | `entities` |
| 사용자 인터랙션 (RecipeForm, DeleteButton)   | `features` |
| 복합 UI 블록 (RecipeGrid, RecipeDetail)      | `widgets`  |
| 페이지 조합                                  | `pages`    |

### 3단계: 구현

**필수 준수 사항** (fsd-conventions 스킬 내용 참조):

- 파일명: kebab-case
- export: named export only
- import: `@/` alias 사용, 반드시 `index.ts` 경유
- 스타일: `@theme` 으로 등록된 canonical 클래스 사용 (`bg-card`, `text-foreground` 등), 하드코딩 색상 금지
- 다크모드: `dark:` 접두사 금지 → CSS 변수가 `[data-theme="dark"]` 속성으로 자동 전환
- 아이콘: `lucide-react`만 사용

**구현 순서:**

1. 타입/스키마 (`model/`) 먼저 작성
2. API 훅 (`api/`) — 필요한 경우
3. UI 컴포넌트 (`ui/`)
4. `index.ts` public API 노출

### 4단계: 검증

구현 완료 후 자체 검증:

**FSD 위반 체크:**

- 생성한 파일의 import 경로가 레이어 규칙을 준수하는지 확인
- 같은 레이어 참조, 역방향 참조 없는지 확인
- index.ts를 통한 public API 노출인지 확인

**토큰 체크:**

- `#`, `rgb(`, `hsl(` 등 하드코딩 색상 없는지 확인
- `bg-[var(--x)]`, `text-[var(--x)]` 구식 문법 → `bg-x`, `text-x` canonical 클래스로 작성했는지 확인
- `dark:` 접두사 없는지 확인

## 구현 완료 출력

```markdown
## `/component-builder <name>` 완료

### 생성된 파일

- `src/<layer>/<name>/ui/<name>.tsx`
- `src/<layer>/<name>/model/<name>.types.ts` (생성 시)
- `src/<layer>/<name>/api/use-<name>.ts` (생성 시)
- `src/<layer>/<name>/index.ts`

### 사용 방법

import { <Name> } from '@/<layer>/<name>'

### 설계 문서 참조

구현에 사용한 설계 문서 섹션 및 주요 결정 사항

### 다음 단계

슬라이스를 조합하거나 연결할 상위 컴포넌트 안내
```

설계 문서에서 필요한 정보를 찾지 못한 경우, 합리적인 추정으로 구현하고 "설계 문서 미확인 항목"을 명시하세요.
