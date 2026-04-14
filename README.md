# 8ake

> _"오늘 만든 마들렌, 다음엔 더 맛있게."_
> 베이킹 레시피와 회고를 기록하는 나만의 디지털 베이킹 아카이브

---

## 왜 8ake인가?

실물 노트에 레시피를 적다 보면 이런 상황이 옵니다.

```
언제 만들었더라? → 노트 뒤적뒤적
오븐 온도가 몇 도였지? → 또 뒤적뒤적
지난번에 뭐가 문제였지? → 기억이 안 남
```

8ake는 그 노트를 디지털로 옮깁니다.
검색되고, 비교되고, 점수까지 매길 수 있는 — 하지만 여전히 노트 감성인 채로.

---

## 주요 기능

| 기능             | 설명                                                          |
| ---------------- | ------------------------------------------------------------- |
| 레시피 아카이브  | 메뉴명, 출처(YouTube/블로그/책), 재료, 만드는 법을 한 곳에    |
| 회고 (1:N)       | 같은 레시피를 여러 번 만들어도 회고는 각각 기록               |
| 레이더 차트      | 맛·식감·보관성·간편성·재료수급 5축 시각화                     |
| 컵케이크 점수    | 별점 대신 컵케이크로 평점 표시                                |
| 재료 리뷰        | 구매처, 품질 점수, 메모를 재료 단위로 관리 (카드/테이블 토글) |
| 재료 가격 추적   | 구매 단가·용량 기록 → 레시피 원가 자동 계산                   |
| 사진 아카이브    | 레시피당 최대 2장, 썸네일 지정 (Canvas 리사이즈 + JPEG 압축)  |
| 태그 필터링      | 자동완성 태그 입력 + 홈 화면 태그 필터                        |
| 베이킹 캘린더    | 월별 베이킹 이력 캘린더 + 월간 원가 차트                      |
| 공개/비공개 전환 | 내 레시피는 기본 비공개, 공유하고 싶을 때만 공개              |
| 다크모드         | 새벽 베이킹을 위한 눈 편한 모드                               |
| PWA / 오프라인   | 설치 가능, 오프라인 읽기 지원 (Workbox)                       |

---

## 스크린샷

> _Notebook & Kraft Paper 컨셉 — 크라프트지 베이지와 테라코타 오렌지로 구성된 아날로그 감성 UI_

| 레시피 목록 | 레시피 상세 | 레시피 폼 | 재료 리뷰 |
| :---------: | :---------: | :-------: | :-------: |
|   (soon)    |   (soon)    |  (soon)   |  (soon)   |

---

## 기술 스택

### Frontend

| 라이브러리            | 버전      | 용도                             |
| --------------------- | --------- | -------------------------------- |
| Vite                  | 8.x       | 빌드 도구 (Rolldown 기반)        |
| React + TypeScript    | 19.x      | 앱 기반                          |
| TailwindCSS           | v4.x      | CSS-first 스타일링 (`@theme {}`) |
| shadcn/ui (new-york)  | latest    | UI 컴포넌트 (Tailwind v4 지원)   |
| lucide-react          | 1.6.x     | 아이콘                           |
| TanStack Router       | 1.x       | 파일 기반 라우터 (타입 안전)     |
| TanStack Query        | 5.x       | 서버 상태 관리 + 캐시 무효화     |
| zustand               | 5.x       | 전역 상태 (auth, ui)             |
| react-hook-form + zod | 7.x / 4.x | 폼 관리 및 스키마 검증           |
| recharts              | 3.8.x     | 레이더 차트 / 월간 원가 차트     |
| react-day-picker      | 9.x       | 베이킹 캘린더                    |
| framer-motion         | 12.x      | 애니메이션                       |
| sonner                | 2.x       | 토스트 알림                      |
| date-fns              | 4.x       | 날짜 처리                        |
| workbox-window        | 7.x       | PWA / 오프라인 캐시 전략         |

### Backend (Supabase)

| 서비스   | 용도                                             |
| -------- | ------------------------------------------------ |
| Auth     | Email OTP + Remember me (세션 60일)              |
| Database | PostgreSQL + RLS (사용자별 데이터 격리)          |
| Storage  | 레시피 사진 (`recipe-photos` 버킷, 레시피당 2장) |

### 배포

```
Vercel (자동 배포, main 브랜치) + SPA 리라이트
```

---

## 아키텍처

FSD(Feature-Sliced Design) 기반 모듈 구조를 채택합니다.

```
src/
├── app/             # 앱 진입점, 프로바이더, 글로벌 CSS
├── routes/          # TanStack Router 파일 라우트 (_auth 레이아웃)
├── pages/           # 위젯 조합 페이지
├── widgets/         # 독립 UI 블록
│   ├── recipe-grid/       # 레시피 목록 그리드 (무한 스크롤)
│   ├── recipe-form/       # 레시피 생성/수정 폼
│   ├── recipe-detail/     # 레시피 상세
│   ├── review-list/       # 회고 목록
│   ├── ingredient-list/   # 재료 리뷰 목록
│   ├── baking-calendar/   # 베이킹 캘린더 대시보드
│   ├── monthly-cost-chart/# 월간 원가 차트
│   ├── header-menu/       # 헤더 메뉴
│   └── landing/           # 랜딩 페이지
├── features/        # 사용자 인터랙션 단위
│   ├── auth/              # 인증 (OTP 로그인, 로그아웃)
│   ├── photo-upload/      # 사진 업로드 (Canvas 리사이즈 + Storage)
│   ├── recipe-delete/     # 레시피 삭제
│   └── pwa/               # PWA 설치 프롬프트
├── entities/        # 도메인 타입 + API 훅
│   ├── recipe/            # recipes, recipe_ingredients, recipe_photos
│   ├── review/            # reviews (회고)
│   ├── ingredient/        # ingredients, ingredient_reviews
│   └── tag/               # tags, recipe_tags
└── shared/
    ├── api/         # supabase-client.ts (싱글톤) + database.types.ts
    ├── ui/          # 래핑/커스텀 컴포넌트
    ├── hooks/       # use-intersection-observer 등
    ├── lib/         # cn() 유틸
    └── model/       # ui-store.ts (zustand)
```

레이어 간 참조 방향: `app → routes → pages → widgets → features → entities → shared`

---

## 데이터 모델

```
recipes
  ├── recipe_ingredients  (재료 리스트, 순서 포함)
  ├── recipe_photos       (사진, Storage 경로, 최대 2장)
  ├── recipe_tags         (태그 N:M)
  └── reviews             (회고 1:N)
        └── taste / texture / storability / recipe_simplicity / ingredient_availability
              → 레이더 차트 5개 축
              → total_score (컵케이크 점수)

ingredients
  └── ingredient_reviews  (구매처, 단가, 용량, 품질 점수, 메모)
        → 레시피 원가 계산에 활용

tags
  └── recipe_tags         (레시피 ↔ 태그 N:M)
```

---

## 라우트

| 경로               | 페이지                                        | 인증 |
| ------------------ | --------------------------------------------- | :--: |
| `/`                | 랜딩 페이지 (비로그인) / 레시피 목록 (로그인) |      |
| `/login`           | 이메일 OTP 로그인                             |      |
| `/home`            | 레시피 목록 (검색 + 태그 필터 + 무한 스크롤)  |  ✅  |
| `/calendar`        | 베이킹 캘린더 + 월간 원가 차트                |  ✅  |
| `/recipe/new`      | 레시피 추가 (멀티섹션 폼)                     |  ✅  |
| `/recipe/:id`      | 레시피 상세 + 회고 목록                       |  ✅  |
| `/recipe/:id/edit` | 레시피 수정                                   |  ✅  |
| `/ingredients`     | 재료 리뷰 (카드/테이블 토글)                  |  ✅  |

---

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 타입 검사
npm run typecheck

# 린트
npm run lint
```

> **Node.js >= 20** 필요

---

## 개발 규칙

- **파일명**: kebab-case (`recipe-card.tsx`, `use-recipes.ts`)
- **export**: named export only (default export 금지)
- **import alias**: `@/` → `src/`
- **스타일**: 디자인 토큰(`tokens.css`) 사용, 하드코딩 색상 금지
- **커밋**: `feat` / `fix` / `design` / `refactor` / `chore` / `docs` / `test` / `revert`
- **PR 전**: `npm run lint` + `npm run typecheck` 통과 필수
- **Git hooks**: husky + lint-staged (커밋 시 자동 실행)

---

## 로드맵

- [x] 디자인 시안 확정 (Notebook & Kraft Paper 컨셉)
- [x] 공통 디자인 토큰 정의 (CSS 변수)
- [x] 프로젝트 셋업 (Vite + shadcn + TanStack Router)
- [x] entities / features / widgets / pages / routes 구현
- [x] TanStack Query 도입 (서버 상태 캐싱)
- [x] 태그 필터링 + 자동완성
- [x] 베이킹 캘린더 대시보드
- [x] 재료 가격 추적 + 원가 계산
- [x] PWA + 오프라인 읽기 지원
- [x] Vercel 배포 설정
- [ ] v2: 공개 레시피 피드, 소셜 기능

---

<div align="center">
  <sub>베이킹은 실패해도 맛있다. 기록은 실패 없이 쌓인다.</sub>
</div>
