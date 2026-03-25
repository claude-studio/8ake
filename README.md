# 🍰 8ake

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

| 기능                   | 설명                                                       |
| ---------------------- | ---------------------------------------------------------- |
| 📋 **레시피 아카이브** | 메뉴명, 출처(YouTube/블로그/책), 재료, 만드는 법을 한 곳에 |
| 🔁 **회고 (1:N)**      | 같은 레시피를 여러 번 만들어도 회고는 각각 기록            |
| 📊 **레이더 차트**     | 맛·보관·간편성·재료수급·당도 5축 시각화                    |
| 🧁 **컵케이크 점수**   | 별점 대신 컵케이크로 평점 표시                             |
| 📦 **재료 리뷰**       | 구매처, 품질 평가, 메모를 재료 단위로 관리                 |
| 🖼️ **사진 아카이브**   | 레시피당 최대 2장, 썸네일 지정                             |
| 🔒 **기본 비공개**     | 내 레시피는 내 것. 공유하고 싶을 때만 공개                 |
| 🌙 **다크모드**        | 새벽 베이킹을 위한 눈 편한 모드                            |

---

## 스크린샷

> 🎨 _Notebook & Kraft Paper 컨셉 — 크라프트지 베이지와 테라코타 오렌지로 구성된 아날로그 감성 UI_

| 레시피 목록 | 레시피 상세 | 레시피 폼 | 재료 리뷰 |
| :---------: | :---------: | :-------: | :-------: |
|   (soon)    |   (soon)    |  (soon)   |  (soon)   |

---

## 기술 스택

### Frontend

```
Vite 8 + React 19 + TypeScript
TailwindCSS v4 (CSS-first, @theme)
shadcn/ui (new-york, Tailwind v4)
lucide-react
TanStack Router (파일 기반, 타입 안전)
zustand 5 (auth, ui 상태)
react-hook-form + zod (폼 검증)
recharts (레이더 차트)
sonner (toast)
```

### Backend (Supabase)

```
Auth       — Email OTP + Remember me
Database   — PostgreSQL + RLS
Storage    — 레시피 사진 (recipe-photos 버킷)
```

### 배포

```
Vercel (자동 배포, main 브랜치)
```

---

## 아키텍처

FSD(Feature-Sliced Design) 기반 모듈 구조를 채택합니다.

```
src/
├── app/          # 앱 진입점, 프로바이더
├── routes/       # TanStack Router 파일 라우트
├── pages/        # 위젯 조합 페이지
├── widgets/      # 독립 UI 블록 (recipe-grid, review-list 등)
├── features/     # 사용자 인터랙션 단위 (auth, photo-upload 등)
├── entities/     # 도메인 타입 + API 훅 (recipe, review, ingredient)
└── shared/       # 공통 유틸, 디자인 토큰, UI 프리미티브
```

레이어 간 참조 규칙: `app → pages → widgets → features → entities → shared`

---

## 데이터 모델

```
recipes
  ├── recipe_ingredients  (재료 리스트)
  ├── recipe_photos       (사진, Storage 경로)
  └── reviews             (회고 1:N, 레이더 차트 데이터)

ingredients
  └── ingredient_reviews  (재료 리뷰)
```

---

## 라우트

| 경로               | 페이지                    | 인증 |
| ------------------ | ------------------------- | :--: |
| `/login`           | 이메일 OTP 로그인         |      |
| `/`                | 레시피 목록 (무한 스크롤) |  ✅  |
| `/recipe/new`      | 레시피 추가               |  ✅  |
| `/recipe/:id`      | 레시피 상세 + 회고        |  ✅  |
| `/recipe/:id/edit` | 레시피 수정               |  ✅  |
| `/ingredients`     | 재료 리뷰                 |  ✅  |

---

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 개발 서버
pnpm dev
```

---

## 개발 규칙

- **파일명**: kebab-case (`recipe-card.tsx`, `use-recipes.ts`)
- **커밋**: `feat`, `fix`, `design`, `refactor`, `chore`, `docs`, `test`, `revert`
- **PR 전**: `pnpm lint` + `pnpm typecheck` 통과 필수

---

## 로드맵

- [x] 디자인 시안 확정 (Step 1~4)
- [x] 공통 디자인 토큰 정의
- [x] 프로젝트 셋업 (Vite + shadcn + TanStack Router)
- [ ] Supabase DB / Auth / Storage 설정
- [ ] 핵심 기능 구현
- [ ] Vercel 배포
- [ ] v2: 공개 레시피 피드, 태그 필터링, 소셜 기능

---

<div align="center">
  <sub>베이킹은 실패해도 맛있다. 기록은 실패 없이 쌓인다.</sub>
</div>
