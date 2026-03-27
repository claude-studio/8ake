---
name: design-ref
description: '8ake 설계 문서에서 특정 컴포넌트/페이지/기능의 명세를 추출. 사용법: /design-ref <keyword> — 예: /design-ref recipe-form, /design-ref auth, /design-ref recipe-card. 구현 전 FSD 구조, 컴포넌트 props, 데이터 스키마, 스타일 명세를 빠르게 확인할 때 사용.'
context: fork
agent: Explore
argument-hint: '<keyword>'
user-invocable: true
---

# 설계 문서 참조

인자에서 `<keyword>`를 추출하세요. 없으면 사용법을 안내하세요.

```
사용법: /design-ref <keyword>
예시:   /design-ref recipe-form
        /design-ref auth
        /design-ref recipe-card
        /design-ref recipe-list
```

## 참조할 문서

다음 순서로 읽고 키워드 관련 섹션을 추출하세요:

1. **`docs/02-design/features/ui.design.md`** — 주요 설계 문서
   - FSD 슬라이스 구조, 컴포넌트 명세, API 훅, 상태 설계, DB 스키마

2. **`docs/00-pm/ui.prd.md`** — PRD (사용자 요구사항)
   - 기능 설명, 비즈니스 규칙, 데이터 요구사항

3. **`docs/design-mockups/`** — 디자인 시안 HTML 파일 (관련 파일명 추정)
   - 시각적 명세, 레이아웃, 컴포넌트 구조

## 추출 방식

키워드가 포함된 섹션, 테이블, 코드 블록을 찾아 관련 내용 전체를 추출하세요. 연관 항목도 포함하세요 (예: `recipe-card` 검색 시 `entities/recipe`, `RecipeCard`, `use-recipes` 관련 내용도 포함).

## 출력 형식

```markdown
## `/design-ref <keyword>` 결과

### FSD 구조

어느 레이어/슬라이스에 위치하는지

### 컴포넌트 명세

Props, 역할, 사용 위치

### 데이터 / 스키마

관련 타입, Supabase 테이블, API 훅

### 스타일 명세

레이아웃, 색상 토큰, 반응형

### 디자인 시안

관련 HTML 파일명 및 확인 방법

### 구현 시 참고사항

설계 문서에서 중요한 제약이나 주의사항
```

관련 내용이 없는 섹션은 생략하세요.
문서에서 찾지 못한 경우 "설계 문서에 해당 키워드 관련 내용 없음"을 안내하고, 유사한 키워드를 제안하세요.
