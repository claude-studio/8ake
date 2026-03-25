# ui — Plan Document

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | ui (8ake 전체 UI 구현) |
| 시작일 | 2026-03-25 |
| MVP 목표 | 2026-04-01 |
| 담당 | 단독 개발 |

### Value Delivered

| 관점 | 내용 |
|------|------|
| Problem | 베이킹 레시피·회고를 실물 노트에만 기록해 검색·관리가 불편하다 |
| Solution | 레시피 CRUD + 회고(1:N) + 재료 리뷰를 통합한 모바일/태블릿 최적화 웹앱 |
| Function & UX Effect | 멀티섹션 폼, 레이더 차트 회고 시각화, 컵케이크 점수 UI로 직관적 기록 경험 제공 |
| Core Value | 베이킹 경험을 체계적으로 쌓고 돌아볼 수 있는 나만의 디지털 베이킹 아카이브 |

---

## 1. 구현 범위

### 포함 (v1 MVP)

- 인증: Email OTP + Remember me
- 레시피 CRUD (목록 / 상세 / 추가 / 수정 / 삭제)
- 회고 (레시피당 1:N, 레이더 차트)
- 재료 리뷰 (카드/테이블 토글)
- 사진 업로드 (최대 2장, 썸네일 지정)
- 태그 (자유 입력/표시)
- 공개/비공개 구조 (is_public 필드, RLS)
- 다크모드 / 라이트모드

### 제외 (v2+)

- 공개 레시피 피드 (타 사용자 레시피 탐색)
- 태그 필터링
- 소셜 기능 (댓글, 좋아요)

---

## 2. 기술 스택

### 프론트엔드

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Vite | 8.x | 빌드 도구 (Rolldown) |
| React + TypeScript | 19.x | 앱 기반 |
| TailwindCSS | v4.x | 스타일링 (CSS-first, @tailwindcss/vite) |
| shadcn/ui | latest | UI 컴포넌트 (Tailwind v4 지원) |
| lucide-react | 1.6.x | 아이콘 |
| zustand | 5.x | 전역 상태 (auth, ui) |
| @tanstack/react-router | latest | 파일 기반 라우터 (타입 안전) |
| sonner | latest | toast 알림 (shadcn toast 대체) |
| react-hook-form | 7.x | 폼 관리 |
| zod | 4.x | 스키마 검증 (+@hookform/resolvers) |
| recharts | 3.8.x | 레이더 차트 |

### 백엔드

| 서비스 | 용도 |
|--------|------|
| Supabase Auth | Email OTP (`signInWithOtp` → `verifyOtp`) |
| Supabase DB (PostgreSQL + RLS) | 데이터 저장 및 접근 제어 |
| Supabase Storage | 사진 저장 (레시피당 최대 5장, 5MB/장) |

### 배포 / 개발환경

- Vercel (프론트엔드 배포)
- eslint / prettier / husky / commitlint

> turborepo는 단일 앱 구성이므로 필요 시 제거 검토

---

## 3. 데이터 모델

### 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `recipes` | 레시피 기본정보 |
| `recipe_ingredients` | 레시피별 재료 리스트 |
| `recipe_photos` | 레시피 사진 (Storage 경로) |
| `reviews` | 회고 (recipes 1:N) |
| `ingredients` | 재료 마스터 (사용자 등록) |
| `ingredient_reviews` | 재료별 리뷰 |

### recipes

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | 메뉴명 |
| source_type | text | youtube/blog/book/etc |
| source_url | text | 출처 |
| oven_temp | text | 오븐 온도 |
| bake_time | text | 굽는 시간 |
| quantity | text | 분량 |
| steps | text | 만드는 법 |
| memo | text | 메모 |
| thumbnail_photo_id | uuid | FK → recipe_photos |
| tags | text[] | 자유 태그 |
| is_public | boolean | 공개 여부 (기본 false) |
| created_at | timestamptz | |

### recipe_ingredients

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes |
| name | text | 재료명 |
| amount | text | 용량/수량 |
| order | int | 정렬 순서 |

### recipe_photos

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes |
| storage_path | text | Supabase Storage 경로 |
| order | int | 정렬 순서 |

### reviews

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes (1:N) |
| user_id | uuid | FK → auth.users |
| date | date | 베이킹 날짜 |
| total_score | int | 종합 점수 1~5 |
| taste | int | 맛 1~5 |
| storability | int | 보관 용이성 1~5 |
| recipe_simplicity | int | 레시피 간편성 1~5 |
| ingredient_availability | int | 재료 수급 용이성 1~5 |
| texture | int | 당도 1~5 |
| comment | text | 후기 |
| storage_memo | text | 보관 메모 |
| created_at | timestamptz | |

### ingredients

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | 재료명 |
| created_at | timestamptz | |

### ingredient_reviews

| 필드 | 타입 | 비고 |
|------|------|------|
| id | uuid | PK |
| ingredient_id | uuid | FK → ingredients |
| user_id | uuid | FK → auth.users |
| purchase_place | text | 구매처 |
| score | int | 평가 1~5 |
| memo | text | 메모 |
| created_at | timestamptz | |

### RLS 정책

| 테이블 | 규칙 |
|--------|------|
| recipes | 본인 소유 OR is_public = true |
| recipe_ingredients | recipes 소유자 |
| recipe_photos | recipes 소유자 |
| reviews | 본인 소유 |
| ingredients | 본인 소유 |
| ingredient_reviews | 본인 소유 |

---

## 4. 페이지 구조 및 기능

### 라우트

| 경로 | 페이지 | 인증 필요 |
|------|--------|----------|
| `/login` | 이메일 OTP 로그인 | X |
| `/` | 레시피 목록 | O |
| `/recipe/new` | 레시피 추가 | O |
| `/recipe/:id` | 레시피 상세 + 회고 | O |
| `/recipe/:id/edit` | 레시피 수정 | O |
| `/ingredients` | 재료 리뷰 | O |

### 주요 기능 명세

**레시피 목록 (`/`)**
- 카드 그리드: 썸네일, 메뉴명, 날짜, 출처, 종합점수(컵케이크)
- 검색(메뉴명), 정렬(날짜/점수), 무한 스크롤

**레시피 추가/수정 (`/recipe/new`, `/recipe/:id/edit`)**
- 멀티섹션 폼: 기본정보 → 재료 → 만드는 법 → 사진 → 회고(선택)
- 재료 동적 추가/삭제 (애니메이션)
- 사진 드래그앤드롭 + 미리보기 + 썸네일 지정 (최대 2장)
- 인라인 에러, 저장 상태 toast, 에러 시 자동 스크롤

**레시피 상세 (`/recipe/:id`)**
- 레시피 정보 섹션 + 사진 갤러리
- 회고 리스트 (최신순) + 회고 추가 버튼
- 레이더 차트 (맛/보관용이성/레시피간편성/재료수급용이성/당도)
- 컵케이크 아이콘 종합점수 표시

**재료 리뷰 (`/ingredients`)**
- 카드 / 테이블 뷰 토글
- 재료 등록 + 리뷰 작성/수정/삭제

**인증 (`/login`)**
- 이메일 입력 → OTP 발송 → 코드 입력 2-step
- Remember me 체크박스

---

## 5. UI 개발 프로세스

화면 코드 작성 전 `/frontend-design` 스킬 기반 디자인 확정 필수.

| 스텝 | 대상 페이지 | 확정 후 진행 |
|------|-----------|------------|
| Step 1 | 레시피 목록 (`/`) | Step 2 진행 |
| Step 2 | 레시피 상세 (`/recipe/:id`) | Step 3 진행 |
| Step 3 | 레시피 추가/수정 폼 | Step 4 진행 |
| Step 4 | 재료 리뷰 (`/ingredients`) | 전체 확정 → 코드 구현 |

각 스텝: 병렬 에이전트가 복수 시안 제시 → 사용자 선택 확정 → 다음 스텝

> 규칙: 모든 스텝 확정 전 화면 코드 작성 금지

---

## 6. 구현 순서

### Phase 1: 프로젝트 셋업
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] TailwindCSS v4 + @tailwindcss/vite 설정
- [ ] shadcn/ui init (Tailwind v4 옵션)
- [ ] 베이킹 테마 컬러 토큰 설정 (@theme)
- [ ] 라우터 설정 (@tanstack/react-router + @tanstack/router-vite-plugin)
- [ ] Supabase 클라이언트 초기화
- [ ] eslint / prettier / husky / commitlint 설정
- [ ] Vercel 배포 연결

### Phase 2: DB / Supabase 설정
- [ ] 테이블 생성 (6개)
- [ ] RLS 정책 적용
- [ ] Storage 버킷 생성 (recipe-photos)
- [ ] Auth OTP 이메일 템플릿 설정

### Phase 3: 디자인 확정 (frontend-design)
- [ ] Step 1: 레시피 목록 시안 확정
- [ ] Step 2: 레시피 상세 시안 확정
- [ ] Step 3: 레시피 폼 시안 확정
- [ ] Step 4: 재료 리뷰 시안 확정

### Phase 4: 핵심 기능 구현
- [ ] 인증 (OTP + Remember me + 보호 라우트)
- [ ] zustand 스토어 (auth, ui)
- [ ] Supabase 쿼리 훅 (레시피 CRUD)
- [ ] 레시피 목록 페이지
- [ ] 레시피 상세 페이지
- [ ] 레시피 추가/수정 폼
- [ ] 사진 업로드 (Storage)
- [ ] 회고 CRUD + 레이더 차트
- [ ] 재료 리뷰 페이지

### Phase 5: 마무리
- [ ] 다크모드 / 라이트모드 검증
- [ ] 모바일 / 태블릿 반응형 검증
- [ ] Vercel 배포 최종 확인

---

## 7. 디자인 시스템

> 상세 내용은 PRD Section 4 참조. 아래는 구현 시 필수 준수 항목.

### 지원 환경

| 브레이크포인트 | 범위 |
|--------------|------|
| mobile | ~ 767px |
| tablet | 768px ~ 1024px |

- 데스크탑 미지원 (tablet 최대폭으로 중앙 정렬)

### 컬러 팔레트 (베이킹 테마, 미니멀)

| 역할 | 방향 |
|------|------|
| Primary | 따뜻한 베이지 / 크림 계열 |
| Accent | 브라운 계열 (초콜릿, 카라멜 톤) |
| Neutral | 회색 계열 (텍스트, 배경) |
| Destructive | shadcn/ui 기본 red 유지 |

- 다크모드: Primary/Accent를 어둡게 조정, 과도한 색상 사용 금지
- TailwindCSS v4 `@theme {}` 블록에서 CSS 변수로 정의

---

## 8. 리스크 / 주의사항

| 항목 | 내용 |
|------|------|
| TailwindCSS v4 | `tailwind.config.js` 없음, CSS `@theme` 방식으로 커스텀 컬러 설정 |
| shadcn/ui toast | deprecated → sonner 사용 |
| 레이더 차트 | recharts RadarChart, 모바일 터치 인터랙션 확인 필요 |
| 사진 업로드 | 2장 초과 방지 로직 프론트 + Storage 규칙 이중 처리 |
| OTP 속도 제한 | 60초마다 1회 요청 가능, UI에서 재전송 타이머 필요 |
| Storage 용량 | 장당 5MB × 2장 = 10MB/레시피, Supabase 무료 플랜 1GB 한도. 초과 시 이미지 압축 또는 플랜 업그레이드 필요 |
| turborepo | 단일 앱이므로 필요 없을 시 제거 |
| @supabase/supabase-js | 2.99.x 사용 |
