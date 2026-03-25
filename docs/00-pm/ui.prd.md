# 8ake PRD

## Executive Summary

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 8ake |
| 작성일 | 2026-03-25 |
| MVP 목표 | 2026-04-01 (1주일) |
| 배포 | Vercel + Supabase |

### Value Delivered

| 관점 | 내용 |
|------|------|
| Problem | 베이킹 레시피와 회고를 실물 노트에만 기록해 검색·관리가 불편하다 |
| Solution | 레시피 CRUD + 회고 + 재료 리뷰를 통합한 개인용 디지털 베이킹 노트 |
| Function & UX Effect | 모바일/태블릿 최적화, 직관적인 폼 UX, 레이더 차트로 회고 시각화 |
| Core Value | 베이킹 경험을 체계적으로 기록하고 돌아볼 수 있는 나만의 베이킹 아카이브 |

---

## 1. 사용자 정의

### 현재 (v1)
- 소수의 베이킹 취미 사용자
- 초대 기반 또는 알고 있는 이메일로 접근

### 추후 (v2+)
- 누구나 이메일 OTP로 가입 가능한 공개 서비스로 확장
- 현재 데이터 격리 구조(RLS)는 확장을 고려하여 설계

---

## 2. 기능 요구사항

### FR-01: 인증

- **방식**: Email OTP (이메일 6자리 코드)
- **Remember me**: 체크 시 세션 60일 유지, 미체크 시 브라우저 종료 시 만료
- 미인증 사용자 → `/login` 리다이렉트
- 로그인 성공 → `/` 리다이렉트

**세션 정책**

| 항목 | 값 |
|------|-----|
| Access Token | 1시간 |
| Refresh Token | 60일 |
| Remember me OFF | 브라우저 종료 시 만료 |
| Remember me ON | Refresh Token 기간 자동 갱신 |

---

### FR-02: 레시피 CRUD

**목록 조회 (`/`)**
- 카드 그리드 (썸네일, 메뉴명, 날짜, 출처, 종합 점수)
- 검색: 메뉴명
- 정렬: 날짜 / 종합 점수
- 무한 스크롤

**상세 조회 (`/recipe/:id`)**
- 레시피 정보: 메뉴명, 출처(링크), 재료 리스트, 만드는 법(오븐온도/굽는시간/분량), 메모
- 사진 갤러리 (최대 2장)
- 회고 리스트 (최신순, 여러 개)
- 태그 표시
- 공개 여부 표시

**추가 (`/recipe/new`)**
- 멀티섹션 폼: 기본정보 → 재료 → 만드는 법 → 사진 → 회고(선택)
- 재료: 동적 추가/삭제
- 사진: 최대 2장 업로드, 썸네일 지정
- 태그: 자유 입력
- 공개/비공개 선택 (기본: 비공개)

**수정 (`/recipe/:id/edit`)**
- 추가와 동일한 폼 구조, 기존 데이터 사전 입력

**삭제**
- 상세 페이지에서 삭제
- 확인 다이얼로그 후 처리

---

### FR-03: 회고 (1:N)

- 하나의 레시피에 회고 여러 개 작성 가능 (같은 레시피로 여러 번 베이킹)
- 각 회고: 날짜, 종합점수(컵케이크 1~5), 오각형 레이더 차트 평가, 후기, 보관 메모

**레이더 차트 5개 축**
- 맛
- 보관 용이성
- 레시피 간편성
- 재료 수급 용이성
- 당도

---

### FR-04: 재료 리뷰 (`/ingredients`)

- 사용자가 직접 재료 등록
- 재료별로 리뷰 작성 (구매처, 평가 1~5, 메모)
- 뷰 토글: 카드 / 테이블
  - 카드: 재료명, 구매처, 평가(컵케이크), 메모
  - 테이블: 날짜, 재료명, 구매처, 평가, 메모
- 재료 리뷰 추가 / 수정 / 삭제

---

### FR-05: 태그

- 레시피에 자유 태그 입력 (예: 쿠키, 크림치즈)
- 목록에서 태그로 필터링 (v2 고려)

---

### FR-06: 사진 업로드

- 레시피당 최대 2장
- 드래그 앤 드롭 + 파일 선택
- 업로드 미리보기
- 썸네일 지정
- 장당 최대 5MB

---

### FR-07: 레시피 공개/비공개

- 기본값: 비공개 (`is_public: false`)
- 작성자가 공개 설정 시 다른 사용자도 조회 가능
- RLS로 접근 제어

---

## 3. 데이터 모델

### Recipe

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → User |
| name | string | 메뉴명 |
| source_type | enum | youtube / blog / book / etc |
| source_url | string | 출처 URL 또는 텍스트 |
| oven_temp | string | 오븐 온도 |
| bake_time | string | 굽는 시간 |
| quantity | string | 분량 |
| steps | string | 만드는 법 |
| memo | string | 메모 |
| thumbnail_photo_id | uuid | 썸네일 사진 |
| tags | string[] | 자유 태그 |
| is_public | boolean | 공개 여부 (기본: false) |
| created_at | timestamp | 생성일 |

### RecipeIngredient (레시피 재료)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → Recipe |
| name | string | 재료명 |
| amount | string | 용량/수량 |
| order | number | 정렬 순서 |

### RecipePhoto (레시피 사진)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → Recipe |
| storage_path | string | Supabase Storage 경로 |
| order | number | 정렬 순서 |

### Review (회고)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → Recipe (1:N) |
| user_id | uuid | FK → User |
| date | date | 베이킹 날짜 |
| total_score | number | 종합 점수 (1~5) |
| taste | number | 맛 (1~5) |
| storability | number | 보관 용이성 (1~5) |
| recipe_simplicity | number | 레시피 간편성 (1~5) |
| ingredient_availability | number | 재료 수급 용이성 (1~5) |
| texture | number | 당도 (1~5) |
| comment | string | 후기 |
| storage_memo | string | 보관 메모 |
| created_at | timestamp | 생성일 |

### Ingredient (재료 마스터)

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
| score | number | 평가 (1~5) |
| memo | string | 메모 |
| created_at | timestamp | 생성일 |

---

## 4. UI/UX 요구사항

### 지원 환경

| 브레이크포인트 | 범위 |
|--------------|------|
| mobile | ~ 767px |
| tablet | 768px ~ 1024px |

- 데스크탑 미지원 (tablet 최대폭으로 중앙 정렬)

### 디자인 시스템

- 컴포넌트: **shadcn/ui 100%** (커스텀 최소화)
- 디자인 작업: `/frontend-design` 스킬 기반
- 다크모드 / 라이트모드 지원

### 컬러 팔레트 (베이킹 테마, 미니멀)

| 역할 | 방향 |
|------|------|
| Primary | 따뜻한 베이지 / 크림 |
| Accent | 브라운 (초콜릿, 카라멜) |
| Neutral | 회색 (텍스트, 배경) |
| Destructive | shadcn 기본 red |

### UX 원칙 (폼)

- 멀티섹션 분리: 기본정보 → 재료 → 만드는 법 → 사진 → 회고
- 인라인 에러: 필드 하단 즉시 표시
- 동적 필드: 재료 추가/삭제 애니메이션
- 저장 상태: 저장중 / 완료 / 실패 toast 표시
- 에러 시 해당 필드 자동 스크롤

### UI 개발 프로세스

화면 구현 전 `/frontend-design` 스킬 기반 디자인 확정 절차:

| 스텝 | 대상 | 내용 |
|------|------|------|
| Step 1 | 레시피 목록 | 카드 그리드, 검색/정렬 시안 복수 제시 |
| Step 2 | 레시피 상세 | 레시피 + 회고 + 레이더 차트 시안 복수 제시 |
| Step 3 | 레시피 추가/수정 | 멀티섹션 폼, 사진 업로드 시안 복수 제시 |
| Step 4 | 재료 리뷰 | 카드/테이블 토글 시안 복수 제시 |

각 스텝을 사용자가 확정한 후 다음 스텝 진행. 전체 확정 후 실제 코드 구현.

---

## 5. 기술 요구사항

### 프론트엔드

| 기술 | 용도 |
|------|------|
| Vite + React + TypeScript | 앱 기반 |
| @tanstack/react-router | 파일 기반 라우터 (타입 안전) |
| TailwindCSS | 스타일링 |
| shadcn/ui | UI 컴포넌트 |
| lucide-react | 아이콘 |
| zustand | 전역 상태 |
| react-hook-form + zod | 폼 검증 |
| recharts | 레이더 차트 |

### 백엔드

| 기술 | 용도 |
|------|------|
| Supabase Auth | Email OTP 인증 |
| Supabase DB (PostgreSQL) | 데이터 저장 + RLS |
| Supabase Storage | 사진 저장 |

### 배포

- **Vercel** (프론트엔드)
- Supabase (백엔드 SaaS)

### 개발 환경

- turborepo
- eslint / prettier
- husky + commitlint

---

## 6. 페이지 구조

```
/login                  이메일 OTP 로그인
/                       레시피 목록
/recipe/new             레시피 추가
/recipe/:id             레시피 상세 + 회고 리스트
/recipe/:id/edit        레시피 수정
/ingredients            재료 리뷰 목록
```

---

## 7. 성공 지표

| 지표 | 목표 |
|------|------|
| MVP 배포 | 2026-04-01 |
| 전체 기능 구현 | 레시피 CRUD + 회고 + 재료 리뷰 + 인증 |
| 디자인 확정 | 코드 작업 전 Step 1~4 모두 사용자 컨펌 완료 |

---

## 8. 제약사항 / 리스크

| 항목 | 내용 |
|------|------|
| 사진 용량 | 레시피당 최대 2장, 장당 5MB (Supabase Storage 무료 플랜 1GB) |
| 레이더 차트 | recharts RadarChart 활용, 모바일 터치 인터랙션 확인 필요 |
| 공개 기능 | v1에서 구조만 준비, 공개 레시피 피드는 v2에서 구현 |
| 태그 필터 | v1에서 태그 입력/표시만, 필터링은 v2 |
| turborepo | 단일 앱이므로 monorepo 구성 불필요 시 제거 검토 |
