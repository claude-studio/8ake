# Landing Page Design Brief

> 생성일: 2026-04-16  
> 대상: `src/pages/landing/` 및 `src/widgets/landing/`  
> 상태: 구현 완료

---

## 1. Feature Summary

8ake 베이킹 앱의 첫 인상 페이지. 비로그인 사용자가 서비스의 가치를 빠르게 파악하고 회원가입으로 전환하도록 유도한다. 모바일/태블릿 환경에서 세로 스크롤로 읽히는 단일 흐름 구조다.

---

## 2. Target Audience

- **주 사용자**: 베이킹을 취미로 즐기는 20–30대. 레시피를 반복 개선하고 싶지만 기록 습관이 없는 사람.
- **정서적 상태**: 처음 방문 시 탐색적이고 가벼운 호기심. 강한 설득보다 "이런 게 있네"라는 자연스러운 납득이 필요.

---

## 3. Primary User Action

"무료로 시작하기" 버튼을 눌러 `/login`으로 이동 → 이메일 인증(OTP) 후 앱 진입.  
단일 CTA, 반복 노출 (Hero + BottomCTA).

---

## 4. Design Direction

**모던 베이커리 브랜딩 — 에디토리얼 매거진**

- 베이킹의 아날로그 감성을 현대적인 타이포그래피로 표현
- 따뜻한 베이지+오렌지 팔레트 (기존 토큰 유지)
- 화려한 장식 대신 텍스트 강약 자체로 리듬을 만드는 타이포그래피 중심 레이아웃

### 폰트

| 역할           | 패밀리                     | 변수             |
| -------------- | -------------------------- | ---------------- |
| Display / 장식 | Bodoni Moda (Google Fonts) | `--font-display` |
| Body / UI      | Pretendard                 | `--font-sans`    |

### 컬러 토큰

| 토큰                 | 값        | 용도                        |
| -------------------- | --------- | --------------------------- |
| `--background`       | `#f5ede0` | 페이지 배경 (따뜻한 베이지) |
| `--primary`          | `#c2673a` | 핵심 텍스트 강조, CTA       |
| `--foreground`       | `#1e1410` | 본문 텍스트                 |
| `--muted-foreground` | —         | 보조 텍스트, 설명           |
| `--surface`          | —         | Why 섹션 배경 구분          |

---

## 5. Page Structure

```
LandingNav
├── HeroSection          ← 100dvh fullscreen, 타이포그래피 중심
├── FeaturesSection      ← 에디토리얼 리스트 (번호 + 제목 + 설명)
├── WhySection           ← 3가지 사용 이유, 번호 마커
└── BottomCtaSection     ← 따뜻한 다크 배경 + 반복 CTA
LandingFooter
```

StepsSection은 WhySection과 중복으로 판단하여 제거됨.

---

## 6. Section Specs

### HeroSection

- 높이: `h-dvh` (풀스크린)
- 콘텐츠 위치: `justify-between` (상단 레이블 + 하단 콘텐츠 + 스크롤 인디케이터)
- 상단 앵커: "Baking Archive" (Bodoni Moda italic, `text-muted-foreground/60`, `text-[0.65rem]`)
- 배경 워터마크: "Archive" (Bodoni Moda, `text-foreground/[0.04]`)
- 타이포그래피 강약:
  - 1행 "오늘 만든 마들렌," — `clamp(1.5rem,5.5vw,3rem) font-bold text-foreground/70` (작고 흐릿)
  - 2행 "다음엔 더 맛있게." — `clamp(2.6rem,11vw,7rem) font-black text-primary` (크고 강렬)
- 애니메이션: `overflow-hidden` 래퍼 + `y: 105% → 0` 텍스트 리빌, EASE_EXPO, STAGGER
- 스크롤 인디케이터: `scrollY > 60` 이후 단방향 페이드아웃 (framer-motion `useMotionValueEvent`)
- CTA: "무료로 시작하기" 버튼 (`flex-col`), 미세카피 "이메일만으로 · 카드 불필요" 버튼 아래 (`text-muted-foreground/70`)

### FeaturesSection

- 형식: 에디토리얼 리스트
- 각 항목: 번호(`text-xs text-primary/50`) + 제목(`text-base font-extrabold text-foreground/80`) + 설명(`text-xs text-muted-foreground`) + 아이콘(`size={15} text-primary/65`, 제목 우측)
- 구분선: `border-t border-border`
- 기능 목록:
  1. 레시피를 한눈에 모아보기 — `BookOpen`
  2. 같은 레시피, 매번 베이킹 일지 작성 — `PenLine`
  3. 재료도 따로 기록하고 평가 — `Package`
  4. 사진으로 기록을 남기세요 — `Camera`

### WhySection

- 배경: `bg-surface/40` (FeaturesSection과 시각적 구분)
- 섹션 레이블: "왜 8ake인가요?" (Bodoni Moda italic, tracking wide)
- 번호 마커: `0{i+1}` (Bodoni Moda italic, `text-[0.625rem] text-primary/50`)
- 제목: `text-2xl font-black tracking-[-0.04em]`
- 이유 3가지:
  1. 레시피, 기록, 재료가 하나로 연결 (노트앱 차별화)
  2. 매번 성장하는 나의 베이킹
  3. 나만의 비공개 베이킹 노트

### BottomCtaSection

- 배경: `bg-cta-dark` (따뜻한 다크 브라운 토큰 / dark: `var(--foreground)`)
- 배경 워터마크: "8ake" (Bodoni Moda italic, `text-background/10`)
- 헤드라인: `clamp(2rem,7vw,3.5rem) font-black text-background`
- 서브텍스트: "이메일 하나로 30초. 완전 무료, 카드 불필요." (`text-background/65`)
- CTA 버튼: `bg-background text-foreground` (반전 배색)

---

## 7. Interaction Model

- 모든 섹션 입장 애니메이션: `whileInView` + `viewport={{ once: true, margin: '-40px' }}`
- 기본 이징: `EASE_EXPO = [0.16, 1, 0.3, 1]` (ease-out-expo)
- Hero: 페이지 로드 시 즉시 실행 (`animate`), 나머지: 스크롤 트리거 (`whileInView`)
- 스태거: 요소별 `0.08–0.12s` 딜레이

---

## 8. Copy Principles

- 모든 CTA는 "무료로 시작하기"로 통일
- 모든 섹션의 미세카피는 능동태, 1–2줄 이내
- 사용자 이점 중심 (기능 설명 아닌 결과 설명)

---

## 9. What Was Removed

| 제거 항목                                 | 이유                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| StepsSection (3단계 흐름 설명)            | WhySection과 내용 중복, 인지 과부하                                               |
| 히어로 상단 "Baking Archive" 레이블 (1차) | 워터마크와 중복, 불필요한 노이즈 → 이후 `justify-between` 구조로 상단 앵커로 복원 |
| Features 아이콘 컨테이너                  | 템플릿 느낌 강화, 에디토리얼 방향과 불일치                                        |
| "신뢰할 수 있는 나만의 공간" 문구         | 모호하고 마케팅 클리셰                                                            |

---

## 10. Open Questions

- ~~비로그인 사용자가 랜딩을 방문했을 때 LandingNav에 "앱으로 가기" 링크가 없음~~ → 해결: 세션 유무에 따라 "앱 열기" / "로그인" 조건부 렌더링 추가
- 모바일에서 Hero 2행 텍스트 줄바꿈 처리 확인 필요
