# 8ake Project Plan

> **참고**: 이 문서는 초기 스케치입니다. 정본은 아래를 참조하세요.
> - 요구사항: `docs/00-pm/ui.prd.md`
> - 구현 계획: `docs/01-plan/features/ui.plan.md`

## 개요

베이킹 레시피와 회고를 기록하는 개인용 웹앱.
실물 베이킹 노트를 디지털화한 형태로, 레시피 작성 → 베이킹 → 회고 흐름을 지원한다.

---

## 데이터 모델

### Recipe (레시피)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | string | 메뉴명 (오늘의 베이킹) |
| source_type | enum | 출처 유형 (youtube / blog / book / etc) |
| source_url | string | 출처 URL 또는 텍스트 |
| ingredients | Ingredient[] | 재료 리스트 |
| oven_temp | string | 오븐 온도 (예: 180°C) |
| bake_time | string | 굽는 시간 (예: 25분) |
| quantity | string | 분량 (예: 12개) |
| steps | string | 만드는 법 (자유 텍스트) |
| memo | string | 메모 |
| photos | Photo[] | 사진 리스트 |
| thumbnail_photo_id | uuid | 썸네일로 지정된 사진 |
| tags | string[] | 자유 태그 (예: 쿠키, 크림치즈) |
| is_public | boolean | 공개 여부 (기본: false) |
| reviews | Review[] | 회고 리스트 (1:N) |
| created_at | timestamp | 생성일 |

### Ingredient (재료)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → Recipe |
| name | string | 재료명 |
| amount | string | 용량/수량 |

### Review (회고)

Recipe 1개에 여러 회고 작성 가능 (1:N). 같은 레시피를 여러 번 베이킹할 때마다 회고 추가.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → Recipe |
| date | date | 베이킹 날짜 |
| total_score | number | 종합 점수 (1~5, 컵케이크 아이콘) |
| taste | number | 맛 (1~5) |
| storability | number | 보관 용이성 (1~5) |
| recipe_simplicity | number | 레시피 간편성 (1~5) |
| ingredient_availability | number | 재료 수급 용이성 (1~5) |
| texture | number | 경도 (1~5) |
| comment | string | 후기 |
| storage_memo | string | 보관 방법 메모 |

### Ingredient (재료 마스터)

사용자가 직접 등록. 재료 자체 정보를 저장하고, 별도 리뷰 테이블에서 평가를 관리.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → User (등록자) |
| name | string | 재료명 |
| created_at | timestamp | 생성일 |

### IngredientReview (재료 리뷰)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| ingredient_id | uuid | FK → Ingredient |
| user_id | uuid | FK → User |
| purchase_place | string | 구매처 |
| score | number | 평가 (1~5, 컵케이크 아이콘) |
| memo | string | 메모 |
| created_at | timestamp | 생성일 |

---

## 기능 목록

### 1. 레시피 목록 (`/`)

- 카드 그리드 형식
  - 썸네일 사진
  - 메뉴명
  - 날짜
  - 출처
  - 종합 점수 (컵케이크 아이콘)
- 검색 (메뉴명)
- 정렬 (날짜 / 점수)
- 페이지네이션 또는 무한 스크롤

### 2. 레시피 상세 (`/recipe/:id`)

**레시피 정보 섹션**
- 메뉴명, 출처(링크)
- 재료 리스트
- 만드는 법 (오븐 온도 / 굽는 시간 / 분량 + 스텝)
- 메모
- 사진 갤러리

**회고 섹션**
- 날짜
- 종합 점수 (컵케이크 5개 아이콘 선택)
- 오각형 레이더 차트 (맛 / 보관용이성 / 레시피간편성 / 재료수급용이성 / 경도)
- 후기 텍스트
- 보관 메모

### 3. 레시피 추가 (`/recipe/new`)

- 메뉴명 입력
- 출처 타입 선택 + URL/텍스트 입력
- 재료 리스트 (동적 추가/삭제)
- 만드는 법 (오븐 온도, 굽는 시간, 분량, 스텝)
- 메모
- 사진 업로드 + 썸네일 지정
- 회고 입력 (선택)

### 4. 레시피 수정 (`/recipe/:id/edit`)

- 상세와 동일한 필드 편집

### 5. 레시피 삭제

- 상세 페이지에서 삭제 (확인 다이얼로그)

### 6. 재료 리뷰 (`/ingredients`)

- 카드 / 테이블 뷰 토글
- 카드: 재료명, 구매처, 평가(컵케이크), 메모
- 테이블: 날짜, 재료명, 구매처, 평가, 메모
- 재료 리뷰 추가 / 수정 / 삭제

### 7. 인증 (`/login`)

- **방식**: Email OTP (이메일로 6자리 코드 전송)
- **Remember me** 체크박스
  - 체크 O: Refresh Token 유지 → 브라우저 닫아도 세션 유지 (최대 60일)
  - 체크 X: 브라우저 종료 시 세션 만료
- 로그인 후 `/` 로 리다이렉트
- 미인증 상태로 보호 라우트 접근 시 `/login` 으로 리다이렉트

**세션 정책**
| 항목 | 값 |
|------|-----|
| Access Token 만료 | 1시간 |
| Refresh Token 만료 | 60일 |
| Remember me OFF | 브라우저 종료 시 세션 만료 |
| Remember me ON | Refresh Token 기간 동안 자동 갱신 |

---

## 스타일 가이드

### 지원 환경

- **tablet / mobile 전용** (max-width 기준)
- 데스크탑은 미지원 (tablet 최대폭으로 중앙 정렬 처리)

| 브레이크포인트 | 범위 |
|--------------|------|
| mobile | ~ 767px |
| tablet | 768px ~ 1024px |

### 디자인 시스템

- **컴포넌트**: shadcn/ui 100% 사용 (커스텀 컴포넌트 최소화)
- **디자인 작업**: `/frontend-design` 스킬 기반으로 구성
- **다크모드 / 라이트모드** 지원 (shadcn/ui 기본 테마 시스템 활용)

### 컬러 팔레트

베이킹 연상 색상 기반, 미니멀하게 2~3색 이내로 제한

| 역할 | 방향 |
|------|------|
| Primary | 따뜻한 베이지 / 크림 계열 |
| Accent | 브라운 계열 (초콜릿, 카라멜 톤) |
| Neutral | 회색 계열 (텍스트, 배경) |
| Destructive | shadcn/ui 기본 red 유지 |

> 다크모드에서는 Primary/Accent를 어둡게 조정, 과도한 색상 사용 금지

### UX 원칙 (입력 폼)

레시피 추가/수정은 입력 필드가 많으므로 아래 원칙을 준수한다.

- **스텝 분리**: 레시피 기본정보 → 재료 → 만드는 법 → 사진 → 회고 순서로 섹션 구분
- **인라인 에러**: 필드 하단에 즉시 에러 메시지 표시 (react-hook-form + zod)
- **동적 필드**: 재료 추가/삭제는 애니메이션으로 부드럽게 처리
- **저장 상태 표시**: 저장 중 / 완료 / 실패 상태를 버튼 또는 toast로 명확히 표시
- **사진 업로드**: 드래그 앤 드롭 + 미리보기 + 썸네일 지정 UI
- **스크롤 복귀**: 에러 발생 시 해당 필드로 자동 스크롤

---

## 기술 스택

### 프론트엔드

| 라이브러리 | 버전 | 비고 |
|-----------|------|------|
| Vite | 8.x | @vitejs/plugin-react v6, Rolldown 번들러 탑재 |
| React + TypeScript | 19.x | |
| TailwindCSS | v4.x | @tailwindcss/vite 플러그인, CSS-first 설정 방식 |
| shadcn/ui | latest | Tailwind v4 공식 지원, toast → sonner로 대체 |
| lucide-react | 1.6.x | |
| zustand | 5.x | 전역 상태 |
| react-hook-form | 7.x | + @hookform/resolvers |
| zod | 4.x | 폼 검증 |
| recharts | 3.8.x | 레이더 차트, React 19 완전 호환 |

> **주의**: TailwindCSS v4는 `tailwind.config.js` 대신 CSS 파일에서 `@import "tailwindcss"` + `@theme {}` 방식으로 설정. shadcn/ui CLI init 시 v4 옵션 선택 필요.

### 백엔드

| 라이브러리 | 버전 | 비고 |
|-----------|------|------|
| @supabase/supabase-js | 2.99.x | Auth + DB + Storage |

- **Auth OTP API**: `signInWithOtp()` → `verifyOtp({ type: 'email' })` 방식
- RLS: 레시피는 본인 + `is_public=true` 만 조회 가능
- Storage: 사진 최대 2장/레시피, 장당 5MB

### 배포

- Vercel

### 개발 환경

- turborepo
- eslint / prettier
- husky + commitlint

---

## 페이지 구조

```
/login                  이메일 OTP 로그인
/                       레시피 목록
/recipe/new             레시피 추가
/recipe/:id             레시피 상세 + 회고
/recipe/:id/edit        레시피 수정
/ingredients            재료 리뷰 목록
```
