# Plan — login-persist (Remember me 세션 복원)

- **RUN_ID:** `20260718-231751-login-persist`
- **Branch:** `fix/login-persist` (첫 구현 커밋부터 이 브랜치에서. `main` 커밋 금지)
- **작성일:** 2026-07-18
- **Prose language:** ko (식별자·경로·명령·에러 문자열은 영문)
- **입력 브리프:** `.scv/state/20260718-231751-login-persist/brief/plan-brief.md`

---

## 1. Overview

### 문제

로그인 페이지의 **「로그인 상태 유지」(Remember me)** 가 PRD/설계대로 동작하지 않는다.
확정 증상(사용자): 체크 **ON** 상태로 로그인해도 **hard refresh / 재방문 시 로그아웃**된다.

### 목표 (성공 시 관찰 가능한 결과)

1. Remember me **ON**: `signIn` 후 영속 스토리지(localStorage)에 세션이 남고, hard refresh / 재방문 후에도 `auth.session`이 복원되어 보호 라우트(`/_auth/*`)가 유지된다.
2. Remember me **OFF**(회귀 방지): sessionStorage 정책으로 탭/브라우저 종료 시 세션 만료. 로그인 직후 앱 전역 API 호출(모든 `supabase.from(...)`)이 인증 상태로 정상 동작한다.
3. ON 복원 경로(및 OFF 스토리지 선택)를 단위 테스트로 검증한다.
4. 동결 quality gate 통과. 범위 밖 파일 변경 없음.

### Root-cause 분석 (코드 근거)

현재 인증 세션은 **두 개의 GoTrueClient 인스턴스**로 쪼개져 있다.

- `src/shared/api/supabase-client.ts:12` — 싱글톤 `supabase`, `storage: localStorage`.
- `src/shared/api/supabase-client.ts:23` `createLoginClient()` — `storage: sessionStorage` 임시 클라이언트. **명시적 `storageKey`가 없어 두 인스턴스가 동일한 기본 storageKey(`sb-<ref>-auth-token`)를 공유**하고 백엔드 스토리지만 다르다.
- `src/features/auth/model/auth-store.ts:35` `initialize()` — 복원은 **항상 싱글톤** `supabase.auth.getSession()` (= localStorage)만 읽는다.
- `src/pages/login/ui/login-page.tsx:32` — OFF일 때만 `createLoginClient()`로 `signInWithPassword`, ON일 때는 싱글톤 사용. 이후 zustand `setSession(data.session)` + `/home` 이동.
- 앱 전역 데이터 계층(`entities/*/api`, `widgets/*`, `routes/__root.tsx` 등 **11개+ 파일**)은 모두 싱글톤 `supabase`를 import 한다 (`grep` 확인).

이 구조에서 발생하는 결함을 **검증 가능한 주장(claim)** 으로 분해한다.

- **Claim C1 (CONFIRMED · 코드로 확정, 서술 교정):** OFF 경로는 세션을 **버려지는 sessionStorage 임시 클라이언트**에 기록한다. 두 클라이언트가 동일 기본 `storageKey`를 공유하므로 `@supabase/auth-js`의 `BroadcastChannel`이 auth event를 싱글톤 구독자에게 **전달할 수는 있다**(→ Zustand 상태가 순간적으로 갱신될 여지 있음). 결함의 본질은 "이벤트 미전달"이 아니라 **싱글톤의 storage / `getSession()` / API token source에 OFF 세션이 저장되지 않는다**는 점이다 → (a) 로그인 직후 싱글톤 기반 모든 API가 미인증(토큰이 싱글톤 localStorage에 없음), (b) refresh 시 `initialize()`의 `getSession()`이 localStorage를 읽어 `null` → 로그아웃. OFF는 명백히 깨져 있다.
- **Claim C2 (HYPOTHESIS · Phase 0 재현 전까지 미확정):** 동일 기본 storageKey를 공유하는 다중 GoTrueClient 인스턴스는 supabase-js의 "Multiple GoTrueClient instances detected" 경고 대상이며, 공유 auth lock 경합 및 autoRefresh 교차 발화로 세션이 불안정해질 수 있다. 사용자가 확정한 핵심 증상 **ON → refresh 로그아웃**의 후보이지만, **clean ON page load에서는 `createLoginClient()`가 호출되지 않아 싱글톤 1개만 존재**하므로 현재 코드만으로 이 증상의 직접 원인이라 단정할 수 없다. → **§5 Phase 0(런타임 재현)이 선행 필수**이며 그 전까지 hypothesis로 유지한다. clean ON이 storage write / refresh-token / storage 접근·eviction / boot error 등 **다른 지점**에서 실패하면, adapter 작업 착수 전에 실제 실패 지점을 기준으로 root cause를 **재고정(decision_gate)** 한다.
- **Claim C3 (LOW · 코드로 반증됨):** "라우터 context / initialize 타이밍으로 세션 복원 전 redirect". `src/app/app.tsx:48`의 `isLoading` 스피너 게이트가 `initialize()` 완료 전 `RouterProvider` 마운트를 막으므로(`_auth` beforeLoad는 그 이후 실행) 이 경로는 원인이 아니다. → app.tsx/auth-store는 기본 **미변경**.

**결론(원인 분리):**

- **OFF 결함 = 확정 root cause(C1).** "이중 클라이언트 + 스토리지 분리 + 복원 경로 단일화"의 불일치로 OFF 세션이 버려지는 임시 클라이언트에 저장되어 전역 API·복원이 실패한다. 이는 코드로 확정.
- **ON 증상(hard refresh 로그아웃) = Phase 0 대기 hypothesis(C2).** clean ON 경로는 코드상 싱글톤 1개만 존재하므로 현재 코드만으로 원인이 확정되지 않는다. §5 Phase 0 재현으로 dual-client 교차 귀속 여부를 확정한 뒤에만 C2를 root cause로 승격한다.

**교정 방향:** OFF는 즉시 결정적으로 고칠 수 있다 — **단일 클라이언트로 통합**하고 스토리지 백엔드를 rememberMe 설정에 따라 라우팅하되 **로그인·전역 API·복원이 모두 같은 인스턴스/같은 스토리지를 보게** 만든다. 이 통합은 dual-client를 제거하므로 C2가 ON 원인이라면 함께 해소되지만, **ON 증상의 실제 해소는 Phase 0/§4 V5b로 검증**해야 하며 통합만으로 단정하지 않는다.

---

## 2. Architecture (수정 후 세션 영속 모델)

**정책 결정: dual-client 폐기 → single-client + preference-routed storage adapter.**

설계 문서(`docs/02-design/features/ui.design.md` §10)는 `createSupabaseClient(rememberMe)`로 로그인 시점에 storage를 고르는 안을 제시하지만, 이는 로그인마다 새 인스턴스를 만들어 (a) 다중 인스턴스 경합(C2)이 남고 (b) 앱 전역이 쓰는 싱글톤과 여전히 어긋난다. 따라서 설계 의도(“rememberMe로 storage 선택”)는 유지하되 구현은 **단일 인스턴스 + 커스텀 storage 어댑터**로 실현한다.

> ⚠️ 아래 어댑터/정책 설계는 **§5 Phase 0 런타임 재현의 3-way 판정 게이트**(재현+dual-client 귀속 / 재현+다른 실패 지점 / 미재현)를 통과한 뒤에만 착수한다. OFF 통합 자체는 확정 결함(C1) 교정이지만, ON 증상이 미재현이거나 다른 실패 지점이면 coordinator decision_gate로 root cause를 재고정한 뒤 진행한다(자동 Batch 1 진입 금지).

수정 후 모델:

1. **단일 싱글톤 `supabase`** 하나만 존재한다. `auth.storage`에 **커스텀 어댑터**(`SupportedStorage` 계약: `getItem`/`setItem`/`removeItem`)를 주입한다. `persistSession: true`, `autoRefreshToken: true`.
   - **정확한 storageKey 유도(§P2-1):** `VITE_SUPABASE_URL`에서 **supabase-js와 동일 규칙**(`sb-${new URL(url).hostname.split('.')[0]}-auth-token`)으로 default key를 유도해 **단일 공유 상수 `AUTH_STORAGE_KEY`** 로 만든다. 이 상수를 `createClient`에 `storageKey`로 명시 전달(= 기본값과 동일하므로 안전)하고, **동일 상수를 stale 정리 helper가 공유**한다 → client·helper 간 key 불일치·drift 제거. glob/prefix scan 방식 금지. 어댑터는 _스토리지 백엔드만_ 바꾸고 키는 바꾸지 않는다(§8 invariant).
2. **rememberMe 선호값**을 localStorage의 전용 키(`8ake-auth-remember`, 세션 토큰과 분리된 boolean)에 영속한다. 로그인 시 `signInWithPassword` **호출 직전**에 기록하고, 인증 실패 시 이전 값으로 **롤백**한다(§P2-2).
3. **어댑터 라우팅 계약(교정):**
   - `getItem(key)`: 선호값이 가리키는 **한쪽 백엔드에서만** 읽는다. **fallback 금지** — 반대편을 읽어 더 오래된/다른 세션을 복원하는 사고를 막는다(§P1-3).
   - `setItem(key, value)`: 선호값 백엔드에만 쓴다. **여기서 반대편 백엔드를 지우지 않는다** — token 자동 refresh마다 발화하므로 다른 탭의 유효 세션을 clobber하는 회귀를 막는다(§P1-2).
   - `removeItem(key)`: **양쪽 백엔드 모두** 제거. Supabase는 main token·`-code-verifier`·`-user` 등 보조 키마다 어댑터를 개별 호출하므로, 주어진 key를 양쪽에서 지우면 보조 키까지 양쪽에서 정리된다(§P2-1).
   - 선호 플래그가 없으면 기본값 ON(localStorage) — 체크박스 기본값과 일치(단, 아래 legacy 모호 케이스는 예외).
4. **반대편 백엔드 stale 정리는 `setItem`이 아니라 "성공 로그인 시점"에 명시적으로** 수행한다. 로그인 성공 직후(또는 boot 해석 시) 선호값의 **반대편 백엔드**에서 **정확히 `AUTH_STORAGE_KEY` 및 정의된 suffix**(`${AUTH_STORAGE_KEY}-code-verifier`, `${AUTH_STORAGE_KEY}-user`)만 제거한다. **prefix/wildcard scan 금지** — 동일 origin에 다른 Supabase project session(`sb-<other-ref>-auth-token`)이 있어도 절대 건드리지 않는다(§P2-1). 이는 사용자가 명시적으로 정책을 바꾼 auth 이벤트에 묶이므로 안전하다.
5. **복원(refresh/재방문):** boot 시 싱글톤이 `getSession()` → 어댑터가 선호값 백엔드에서만 토큰을 읽어 복원. ON은 localStorage 생존, OFF는 sessionStorage(탭 유지 시 refresh 생존, 탭/브라우저 종료 시 소멸 = PRD 정책).
6. **전역 일관성:** 앱의 11개+ API 호출 지점은 이미 동일 싱글톤을 import 하므로, 싱글톤이 세션을 보유하는 순간 **추가 변경 없이 전이적으로 정상화**된다. `setSession` + `onAuthStateChange`도 같은 인스턴스에서 발화한다.

### Multi-tab 정책 (decision — §P1-2)

remember 선호값은 **브라우저 전역**(localStorage 공유)이며, **탭별로 서로 다른 remember 정책은 지원하지 않는다**. (8ake는 단일 사용자 개인 앱 — 동시 다중 로그인/탭별 상이 정책은 범위 밖.) 동작 규약: 가장 최근 성공 로그인(또는 그 boot 복원)이 브라우저 전역 백엔드를 결정한다.

**핵심 규약 — 수신 탭 SIGNED_OUT 정리 (design lock, §P1-2):** `removeItem`은 **현재 탭의** localStorage/sessionStorage만 지울 수 있고 다른 탭의 tab-격리 sessionStorage에는 접근할 수 없다. Supabase의 동일 `storageKey` `BroadcastChannel`은 다른 탭 구독자에게 `SIGNED_OUT`을 알리지만 **수신 탭의 storage token을 자동 삭제하지 않는다**(현재 `auth-store.ts:41-43` 콜백도 Zustand만 갱신). 따라서 전역 sign-out을 정합하게 만들려면:

- `auth-store.ts`의 `onAuthStateChange` 콜백에서 **`SIGNED_OUT` 수신 시 그 탭이 스스로** `AUTH_STORAGE_KEY` + 정의된 suffix를 **localStorage·sessionStorage 양쪽에서 제거**한다(공유 helper `clearAllAuthStorage()` 사용, 정확 key만). → 다른 탭이 sign-out하면 각 수신 탭이 자기 sessionStorage 잔여 token까지 지우므로 **refresh 후 세션이 부활하지 않는다**. 이 때문에 `src/features/auth/model/auth-store.ts`를 **필수 scope로 승격**(§3·§7).

동작별 규약(교정):

- **ON/ON:** 모든 탭 localStorage 공유 → 저장·메모리 일관.
- **OFF/OFF:** 각 탭 sessionStorage는 **탭 격리**이므로 저장 상태는 탭별로 독립적이다. 한 탭의 OFF sign-in이 broadcast되어 다른 탭 메모리(Zustand)를 갱신할 수 있으나 **그 탭 storage에는 토큰이 없다** → refresh 시 자기 storage(비어 있음)를 읽어 실제 상태로 되돌아간다. 즉 "메모리는 일시적, storage가 authoritative"로 규정하고, OFF는 본질적으로 **tab-local**임을 명시한다(전역 공유는 ON에서만).
- **ON→OFF 전환**(어느 탭이 OFF로 재로그인): 전역 정책이 OFF로 바뀌고 이전 ON 세션(localStorage)은 §4 성공-로그인 정리에서 제거된다. 다른 ON 탭은 다음 boot/auth 이벤트에서 전역 선호값(OFF)을 재적용하며, **이 회귀(다른 탭 재로그인 필요)는 전역 정책 변경의 의도된 결과로 수용**한다.
- **한 탭 sign-out:** 발신 탭 `removeItem` 양쪽 제거 + BroadcastChannel `SIGNED_OUT` → 각 수신 탭이 위 `clearAllAuthStorage()`로 자기 양쪽 백엔드 정리 → 어느 탭도 refresh 후 부활하지 않음.
- **token refresh:** `setItem`이 선호 백엔드에만 쓰므로 반대편을 건드리지 않아 교차 회귀 없음.
- **탭 close/refresh:** ON = localStorage 생존. OFF = 같은 탭 refresh 생존, 정상 탭 close 후 새 탭에서는 sessionStorage 소멸(단, 브라우저 "session restore" 복원 동작은 환경별로 다를 수 있어 V5b에서 구분 기록).

### Legacy migration matrix (§P1-3) — boot 시 최초 해석

| local token | session token   | preference flag         | 규칙                                                                                                     |
| ----------- | --------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| 있음        | 없음            | 있음=ON / 없음(기본 ON) | local 복원 ✓ (기존 ON 사용자 무중단 — §P2-1)                                                             |
| 없음        | 있음            | OFF                     | session 복원 ✓ (동일 탭)                                                                                 |
| 있음        | 없음            | OFF                     | 선호(session) 비어 있음 → 복원 안 함(local fallback 금지). orphan local은 다음 성공 로그인 정리에서 제거 |
| 없음        | 있음            | 있음=ON / 없음          | 선호(local) 비어 있음 → 복원 안 함                                                                       |
| 있음        | 있음 (**동일**) | 임의                    | 선호 백엔드에서 복원, 반대편 redundant → 안전                                                            |
| 있음        | 있음 (**상이**) | 있음                    | 선호 백엔드에서만 복원, 반대편 무시(다음 로그인 정리에서 제거)                                           |
| 있음        | 있음 (**상이**) | **없음(legacy)**        | **모호 → 양쪽 제거 후 강제 재인증**. 더 오래된 local을 묵시 복원하지 않는다                              |
| 없음        | 없음            | 임의                    | 세션 없음 → `/login`                                                                                     |

flag 부재 시 기본 ON은 **모호하지 않을 때만** 안전. 상이한 양쪽 토큰이 공존하는 legacy 모호 케이스는 묵시 복원 대신 sign-out/재로그인으로 처리한다.

**하위 호환:** 기존 ON 사용자 토큰은 localStorage(기본 storageKey)에 있고 flag 부재 시 기본 ON이므로 그대로 복원(§P2-1 회귀 테스트로 고정). 기존 OFF 사용자(구 sessionStorage 임시 클라이언트)는 재로그인 필요 — 원래 깨져 있었으므로 수용. 양쪽 상이 토큰 공존 모호 케이스는 강제 재인증으로 안전 처리.

FSD 준수: `pages/login` → `shared/api`(허용), `shared/api` 내부 모듈화. 레이어 역행 없음.

---

## 3. Files (create / modify / delete)

| 경로                                                           | 변경 종류                | 설명                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/api/auth-storage.ts`                               | **add**                  | 공유 상수 `AUTH_STORAGE_KEY`(VITE_SUPABASE_URL에서 supabase-js 규칙으로 유도) + preference 헬퍼(`getRememberPreference`/`setRememberPreference`) + `authStorage` 어댑터(§2 계약) + stale 정리 helper(`clearOppositeBackend()`, `clearAllAuthStorage()`, 정확 key만). 순수·독립 테스트 가능하게 분리. |
| `src/shared/api/supabase-client.ts`                            | **modify**               | 단일 싱글톤을 `authStorage`로 생성, **`storageKey: AUTH_STORAGE_KEY` 명시 전달**(= 기본값과 동일). `createLoginClient` **제거**(이중 클라이언트 폐기). 스토리지 관련 주석 갱신.                                                                                                                      |
| `src/shared/api/index.ts`                                      | **modify**               | export 조정: `setRememberPreference`(및 필요 시 `clearAllAuthStorage`) 추가, `createLoginClient` 제거.                                                                                                                                                                                               |
| `src/features/auth/model/auth-store.ts`                        | **modify (필수 · 승격)** | `onAuthStateChange` 콜백에서 `SIGNED_OUT` 수신 시 `clearAllAuthStorage()` 호출 → 수신 탭이 자기 localStorage·sessionStorage auth key를 양쪽 제거(§P1-2 다탭 sign-out 부활 방지). Zustand 갱신 로직은 유지.                                                                                           |
| `src/shared/api/__tests__/auth-storage.spec.ts`                | **add**                  | 어댑터 라우팅/no-fallback getItem/removeItem 양쪽·보조키/기본값/legacy 모호 해석 단위 테스트(jsdom). ON 복원 경로의 자동 증명.                                                                                                                                                                       |
| `src/shared/api/__tests__/session-restore.integration.spec.ts` | **add**                  | 실제 `authStorage` + 실제 `createClient` 인스턴스로 세션 저장 → 새 인스턴스 `getSession()` 복원 왕복 검증(V5a, 필수). 네트워크는 stub 세션 주입으로 우회.                                                                                                                                            |
| `src/pages/login/ui/login-page.tsx`                            | **modify**               | dual-client 분기 제거. `signIn` 전 `setRememberPreference(rememberMe)` 호출, 실패 시 이전 preference 롤백, 항상 싱글톤 사용. 관련 주석 정리.                                                                                                                                                         |
| `src/pages/login/ui/__tests__/login-page.spec.tsx`             | **modify**               | 모듈 mock에서 `createLoginClient` 제거·`setRememberPreference` 추가. "signIn 전 preference 설정" + "실패 시 preference 롤백" 단언 추가.                                                                                                                                                              |
| `docs/plans/2026-07-18_login-persist.plan.md`                  | **modify**               | 본 계획 문서(리뷰 라운드 1·2 반영).                                                                                                                                                                                                                                                                  |

**검토했으나 기본 미변경 (근거 §1 C3):** `src/app/app.tsx`. `isLoading` 게이트가 `RouterProvider` 마운트를 막으므로 boot-time redirect race는 원인이 아니다. 런타임에서 복원 타이밍 레이스가 실제 확인될 때에만 **decision_gate 후** 조건부 편집.

> ※ `src/features/auth/model/auth-store.ts`는 round 2에서 **조건부 → 필수 scope로 승격**됐다(§P1-2 `SIGNED_OUT` 정리). `initialize()`의 복원 로직 자체는 이미 싱글톤을 쓰므로 유지하고, `onAuthStateChange` 콜백에만 cleanup 한 줄을 더한다.

`delete` 대상 파일 없음. `createLoginClient`는 파일 삭제가 아니라 수정 파일 내 **심볼 제거**.

**증거 산출물(코드 파일 아님, `.scv` 하위 · 스테이징 금지):** Phase 0 재현 결과와 V5b 수동 브라우저 검증 증거를 `.scv/state/20260718-231751-login-persist/evidence/` 아래에 기록한다(`phase0-repro.md`, `v5-manual.md` + 스크린샷). git 스테이징 대상 아님.

---

## 4. Test Impact (가설 vs 검증 분리)

### 가설

- **H1a (OFF · 확정):** OFF 실패의 근원은 이중 클라이언트/스토리지 분리(§1 C1)이며, 단일 클라이언트 + preference-routed 어댑터로 OFF 저장·복원이 결정적으로 교정된다.
- **H1b (ON · Phase 0 대기 hypothesis):** ON hard-refresh 로그아웃의 근원이 dual-client 교차 동작(§1 C2)이라면 통합으로 함께 해소된다. **단, C2는 §5 Phase 0 재현으로 확정되기 전까지 가설**이며, 통합만으로 ON 해소를 단정하지 않고 V5b로 검증한다.
- **H2:** 앱 전역 11개+ 싱글톤 API 지점은 별도 변경 없이 세션 보유 싱글톤을 통해 전이적으로 정상화된다(“위반/호출부 불변, 동작만 교정”).
- **H3:** 기존 `login-page.spec.tsx`는 `@/shared/api`를 통째로 mock 하므로 실런타임 스토리지와 무관하나, `createLoginClient` import 제거로 mock 형태를 맞춰야 통과한다.

### 검증 (실제로 무엇을 돌리는가)

- **V1 (자동·핵심 증명):** `auth-storage.spec.ts` (jsdom). §2 교정 계약대로 —
  - preference ON → `setItem`이 **localStorage에만** 씀 / OFF → **sessionStorage에만** 씀(`setItem`은 반대편을 지우지 않음).
  - `getItem`이 선호값 백엔드에서만 읽고 **반대편 fallback 안 함**(반대편에만 토큰이 있어도 `null`).
  - `removeItem`이 **양쪽 백엔드** 제거, 그리고 main token 외 `-code-verifier`/`-user` 등 **보조 키도 양쪽에서** 제거됨(§P2-1).
  - **정확 key 한정(§P2-1):** `clearAllAuthStorage()`/`clearOppositeBackend()`가 `AUTH_STORAGE_KEY` + 정의 suffix만 지우고, **무관한 `sb-<other-ref>-auth-token`은 양쪽 백엔드에서 보존**됨을 단언(prefix scan 부재 증명).
  - `AUTH_STORAGE_KEY`가 주어진 `VITE_SUPABASE_URL`에 대해 supabase-js 규칙과 동일한 값으로 유도됨을 단언.
  - 플래그 부재 시 기본 ON.
  - **Legacy 해석:** flag 부재 + 양쪽 상이 토큰 공존 → 양쪽 제거 후 복원 없음(강제 재인증) / flag 부재 + local만 → local 복원(§P1-3 매트릭스).
    → 토큰이 **올바른 백엔드에 저장·복원**되고 무관 세션은 보존됨을 결정적으로 증명.
- **V2:** `login-page.spec.tsx` 갱신. (a) `signInWithPassword` 호출 **이전**에 `setRememberPreference`가 체크박스 값으로 호출됨, (b) 단일 싱글톤만 사용(`createLoginClient` 미참조), (c) **인증 실패 시 preference가 이전 값으로 롤백**됨(§P2-2)을 단언.
- **V3:** `pnpm test:run` 전체 green.
- **V4:** `pnpm typecheck` 무오류. `pnpm lint`(`--max-warnings 0`) 신규 위반 없음.
- **V5a (통합 테스트 · 필수 acceptance):** `session-restore.integration.spec.ts`. **실제 `authStorage` 어댑터 + 실제 `createClient` 인스턴스**로 — stub 세션을 `setSession`으로 써서 스토리지에 기록 → **새 client 인스턴스**를 만들어 `getSession()` 복원 성공(ON=localStorage, OFF=sessionStorage 라우팅) → `removeItem` 경로가 양쪽 정리. jsdom sessionStorage는 프로세스 내 유지이므로 "탭 종료" 소멸은 V5b가 커버.
  - **Flaky/open-handle 완화(리뷰 residual):** 실제 `auth.setSession()`이 token 검증/유저 조회를 유발할 수 있으므로 — deterministic `fetch` stub + 유효한 test JWT/session fixture 사용, `autoRefreshToken: false`로 client 생성(또는 테스트 종료 시 client timer 정리)로 네트워크/타이머 의존을 제거한다.
  - adapter+client 경계의 **복원 계약**을 자동 증명하여 unit(V1)/mock UI(V2)가 못 잡는 실제 저장·복원 왕복을 검증.
- **V5b (수동 브라우저 증거 · 필수 산출물):** 실브라우저(webapp-testing/Playwright 또는 수동)에서 아래 시나리오를 실행하고 `.scv/state/20260718-231751-login-persist/evidence/v5-manual.md`(+스크린샷)로 기록. **각 항목은 pass/fail 단언으로 고정**:
  1. **[pass/fail]** ON 로그인 → **hard refresh → `/home` 유지**(핵심 사용자 증상 확정).
  2. **[pass/fail]** OFF 로그인 → 같은 탭 refresh 유지 → **(a) 정상 탭 close 후 새 탭 → `/login`** / **(b) 브라우저 "session restore"(재열기 복원) 경로 → 결과 별도 기록**(환경별 sessionStorage 복원 차이 구분).
  3. **Multi-tab(§P1-2) — pass/fail 단언:**
     - **(a)** 탭 A에서 sign-out → **탭 B refresh 후에도 `/login`**(수신 탭 `SIGNED_OUT` 정리로 부활 없음). ← P1-2 핵심 회귀 방지.
     - **(b)** 탭 A에서 OFF sign-in → 탭 B는 broadcast로 메모리 갱신될 수 있으나 **refresh 후 자기 storage 기준 상태로 수렴**(memory/storage 일치: 탭 B storage에 foreign token 없음 → `/login`).
     - **(c)** ON/ON, OFF/OFF 저장·메모리 일관 관찰.
  4. **실패/race 경로:** refresh-token error 결과, storage write 실패(private-mode/quota) 결과, 그리고 **`signInWithPassword` 직전 전역 preference 변경 ↔ 실패 rollback 사이에 다른 탭 token refresh가 끼는 race**를 최소 1회 관찰·기록(§P2-2 residual risk).
     jsdom이 커버 못 하는 `getSession` 네트워크 refresh 경로까지 확인하며 **사용자 증상의 최종 확정**. → **V5a·V5b 모두 필수** (frozen gate green만으로는 ON refresh 로그아웃 잔존 가능하므로 acceptance에 포함).

### Lint 재활성 정책

`--max-warnings 0` 특성상 무관 파일의 기존 경고가 드러날 수 있음:

- [x] (C) 후속 이슈로 분리 (**기본 권장**) — 변경 전 `pnpm lint` baseline 기록, 사전 존재 실패는 기록만 하고 자동 범위 확장 금지.
- (A/B) 최소 autofix·decision_gate는 baseline이 본 변경과 직접 얽힐 때만 사용자 확인 후.

---

## 5. To-dos (배치·순서)

### Phase 0 — 런타임 재현 (필수 · 구현 배치 착수 전 선행)

> C2 및 ON 증상의 실제 실패 지점을 **확정**하기 전에는 어댑터 구현(Batch 1+)에 착수하지 않는다.

0-1. 3개 시나리오를 실브라우저(webapp-testing/Playwright 또는 수동)에서 재현한다:

- **(a) fresh-origin ON** — 스토리지 완전 초기화 후 ON 로그인.
- **(b) 기존 local session 보유 ON** — 이미 localStorage 세션이 있는 상태에서 ON 로그인.
- **(c) OFF 시도 후 ON** — 한 번 OFF로 로그인/방문한 뒤 ON 로그인.
  0-2. 각 시나리오에서 다음을 기록: 정확한 기본 auth key(`sb-<ref>-auth-token`)의 **local/session 값**, `signInWithPassword` 결과, refresh **전/후** `getSession()` 결과·error, 발생한 auth event, 콘솔 에러(예: "Multiple GoTrueClient instances", storage/quota 에러). → `.scv/state/20260718-231751-login-persist/evidence/phase0-repro.md`.
  0-3. **판정 게이트 (3-way — clean ON 정상만으로 C2를 확정하지 않는다):**

1.  **ON 증상 재현 + 실패 지점이 dual-client 교차 동작으로 귀속**(예: OFF 시도 후 ON에서 두 번째 client가 실제 생성된 조건에서 재현되고, 그 client/교차 event를 제거·격리하면 사라짐) → **C2 확정** → §2 설계대로 Batch 1 진행.
2.  **ON 증상 재현 + 다른 실패 지점**(storage write / refresh-token / storage 접근·eviction / boot error) → root cause·design **재고정 decision_gate**(coordinator 승인 후 진행).
3.  **세 시나리오 모두 미재현** → **C2 미확정**, evidence에 **"미재현"** 기록 → coordinator decision_gate에서 추가 환경 정보/사용자 재현 조건 확보. **자동으로 Batch 1에 진입하지 않는다.** (단, OFF 통합은 C1 확정 결함이므로, coordinator가 "OFF-only 교정" 범위를 별도 승인하면 그 범위로만 진행 가능.)
    → **verify:** evidence 파일 존재 + 위 3 분기 중 어느 결론인지 명시 + (분기 2·3이면) decision_gate 기록.

### Batch 1 — single-client storage 기반 (shared/api)

1. `src/shared/api/auth-storage.ts` 추가: **공유 상수 `AUTH_STORAGE_KEY`**(VITE_SUPABASE_URL → supabase-js 규칙 유도) + preference 헬퍼(`getRememberPreference`/`setRememberPreference`, 기본 ON) + `authStorage` 어댑터(§2 교정 계약: getItem no-fallback / setItem 반대편 미삭제 / removeItem 양쪽) + **정확 key 정리 helper**(`clearOppositeBackend()`, `clearAllAuthStorage()` — `AUTH_STORAGE_KEY`+suffix만, prefix scan 금지) + boot 시 legacy 모호 해석(매트릭스 §P1-3). → **verify:** `pnpm typecheck`.
2. `supabase-client.ts`를 단일 싱글톤(`authStorage` 주입, **`storageKey: AUTH_STORAGE_KEY` 명시 전달**=기본값과 동일)으로 재작성, `createLoginClient` 제거. → **verify:** `pnpm typecheck`.
3. `index.ts` export 조정(`setRememberPreference`·필요 시 `clearAllAuthStorage` 추가 / `createLoginClient` 제거). → **verify:** `pnpm typecheck` + `grep -rn createLoginClient src/`가 테스트 외 참조 0.

### Batch 2 — 로그인 페이지 + auth-store 배선

4. `login-page.tsx`: dual-client 분기 제거, `signIn` 직전 `setRememberPreference(rememberMe)` 호출(이전 값 캡처), **실패 시 이전 preference 롤백**, 성공 시 `clearOppositeBackend()` 정리, 항상 싱글톤 사용, stale 주석 정리. → **verify:** `pnpm typecheck`.
5. `auth-store.ts`: `onAuthStateChange` 콜백에 **`SIGNED_OUT` 수신 시 `clearAllAuthStorage()` 호출** 추가(수신 탭 양쪽 백엔드 정리, §P1-2). 기존 Zustand 갱신 유지. → **verify:** `pnpm typecheck`.

### Batch 3 — 테스트

6. `auth-storage.spec.ts` 추가(V1 케이스 전부: no-fallback·양쪽/보조키 removeItem·legacy 매트릭스 + **`AUTH_STORAGE_KEY` 유도 검증** + **정리 helper가 무관 `sb-<other-ref>-auth-token` 보존** 단언 포함). → **verify:** `pnpm test:run src/shared/api/__tests__/auth-storage.spec.ts`.
7. `session-restore.integration.spec.ts` 추가(V5a: 실제 authStorage+client 저장→새 인스턴스 getSession 복원, ON/OFF 라우팅, storageKey 기본값 호환·§P2-1; **fetch stub/JWT fixture/autoRefreshToken false로 flaky 완화**). → **verify:** `pnpm test:run src/shared/api/__tests__/session-restore.integration.spec.ts`.
8. `login-page.spec.tsx` mock·단언 갱신(V2: preference 선설정 + 실패 롤백). → **verify:** `pnpm test:run src/pages/login`.

### Batch 4 — gate + 런타임 수용

9. 동결 gate 실행(§6). → **verify:** typecheck·test:run green, lint baseline 대비 신규 위반 0.
10. **런타임 수용(필수):** V5a 통합 테스트 green + V5b 수동 브라우저 증거(§4 시나리오 1–4, pass/fail 단언) 기록·확인. → **verify:** V5a green, `.scv/state/.../evidence/v5-manual.md` 존재 + ON refresh 유지 / OFF close 만료(정상 close vs session-restore 구분) / **다른 탭 sign-out→refresh 후에도 `/login`** / OFF sign-in 수신 탭 memory·storage 일치 / 실패·race 경로 결과 명시.

> 첫 구현 커밋은 **`fix/login-persist` 브랜치**에서 시작(브랜치 생성 후 커밋). 커밋 컨벤션 예: `fix(auth): ...`. push는 사용자 확인 후.

---

## 6. Gate commands (frozen)

```text
pnpm typecheck
pnpm test:run
pnpm lint
```

- 세 스크립트 모두 `package.json`에 존재 확인됨 (`typecheck`=`tsc --noEmit`, `test:run`=`vitest run`, `lint`=`eslint . --max-warnings 0`). 발명 없음.
- `test`(watch용 `vitest`)가 아닌 **`test:run`** 사용.
- **baseline note:** 변경 전 `pnpm lint`를 1회 실행해 사전 실패를 기록. `--max-warnings 0`이므로 무관 경고가 드러나면 Lint 재활성 정책 (C)로 분리, 자동 범위 확장 금지.

---

## 7. Scope manifest (동결 대상)

**Allowed paths / globs (승인 후 동결):**

- `src/shared/api/auth-storage.ts` — add
- `src/shared/api/supabase-client.ts` — modify
- `src/shared/api/index.ts` — modify
- `src/shared/api/__tests__/auth-storage.spec.ts` — add
- `src/shared/api/__tests__/session-restore.integration.spec.ts` — add
- `src/features/auth/model/auth-store.ts` — modify **(round 2 승격: 조건부 → 필수, §P1-2 `SIGNED_OUT` 정리)**
- `src/pages/login/ui/login-page.tsx` — modify
- `src/pages/login/ui/__tests__/login-page.spec.tsx` — modify
- `docs/plans/2026-07-18_login-persist.plan.md` — modify
- **조건부(사전 decision_gate 필수):** `src/app/app.tsx` — 런타임에서 복원 타이밍 레이스(C3)가 실제 확인될 때에만.
- **증거(코드 파일 아님 · `.scv` 하위 · 스테이징 금지, 상한 계산 제외):** `.scv/state/20260718-231751-login-persist/evidence/phase0-repro.md`, `.../evidence/v5-manual.md`(+스크린샷).

**File-count upper bound:** 핵심 **9개**(integration test + `auth-store.ts` 승격 포함). 조건부 **1개**(`app.tsx`) 포함 **하드 상한 10개**(변동 없음, 구성만 재편). `auth-store.ts` `SIGNED_OUT` 정리 로직은 공유 helper(`clearAllAuthStorage()`)를 호출하므로 **별도 테스트 파일 없이 V1(helper 단위) + V5b(다탭 브라우저)로 커버** → 테스트 파일 수 불변. `.scv` 증거 산출물은 repo 코드 파일이 아니므로 상한에 미포함(스테이징 금지).

**Change kinds:** add / modify only. 파일 delete·rename 없음(`createLoginClient`는 심볼 제거).

**Frozen gates:** §6의 세 명령(`pnpm typecheck`, `pnpm test:run`, `pnpm lint`).

승인 후 이 표·상한·종류·gate가 동결된다. 이탈 시 범위 확장 gate(coordinator 자가 확장 금지).

---

## 8. Constraints

- **본 task는 계획 전용** — 애플리케이션 코드 구현 금지. 구현은 후속 배치에서 `fix/login-persist` 브랜치에서 수행.
- Feature branch **`fix/login-persist`**. `main`에 커밋 금지. 첫 구현 커밋은 브랜치 생성 후.
- **`.scv/**`절대 스테이징 금지**.`git add -A` 금지 — 변경 경로만 명시 스테이징.
- 계획/산출물에 대형 코드 스니펫 금지 — 어댑터는 API 계약/동작으로 기술.
- 범위는 auth/login/session 복원에 한정. FSD 경계 준수(`pages` → `shared` 허용).
- 체크박스 기본값(`rememberMe=true`), OTP 방식, Supabase 대시보드 TTL은 변경하지 않음.
- **storageKey invariant (§P2-1):** default key와 **정확히 동일한 값**을 `VITE_SUPABASE_URL`에서 supabase-js 규칙으로 유도해 **단일 공유 상수 `AUTH_STORAGE_KEY`** 로 만들고 client(`storageKey`)·정리 helper가 공유한다. 정리는 그 **정확한 main key + 정의된 suffix에만** 한정 — **prefix/wildcard scan 금지**, 무관 `sb-<other-ref>-auth-token` 보존(V1 단언). 어댑터는 _스토리지 백엔드만_ 라우팅. 회귀 테스트로 고정(V1/V5a).
- **Multi-tab 정책 (§P1-2, design lock):** remember 선호값은 **브라우저 전역**(localStorage). **탭별 서로 다른 remember 정책은 미지원**. 전역 sign-out 정합을 위해 **각 탭의 `SIGNED_OUT` 콜백이 자기 localStorage·sessionStorage auth key를 양쪽 제거**(`clearAllAuthStorage()`) → 다른 탭 sign-out 후 refresh 부활 방지. OFF는 sessionStorage 탭 격리라 본질적으로 tab-local(메모리는 broadcast로 일시 갱신될 수 있으나 storage가 authoritative). 전역 정책 변경 시 다른 탭 재로그인 필요는 의도된 동작.
- **Phase 0 선행 (§P1-1):** 런타임 재현으로 ON 증상의 실제 실패 지점을 확정하기 전 어댑터 구현 착수 금지. 다른 지점 실패 확인 시 decision_gate로 root cause 재고정.
- push는 사용자 확인 전 금지.

---

## 9. Non-goals

- OTP / magic-link 인증 방식 전면 교체(설계 §10의 OTP 플로우 포함) — 범위 밖.
- Supabase 대시보드 JWT/Refresh TTL 등 서버 설정 변경 — 필요 시 문서만.
- PWA offline/캐시 정책 전면 개편.
- 무관 리팩터, 디자인 시스템, 다른 페이지 UX.
- 기존 11개+ `supabase.from(...)` 호출부 재설계 — 이미 싱글톤을 쓰므로 전이적으로 해결되며 손대지 않음.

---

## 10. Implementation deltas vs original plan

- 구현 중 범위 확장·decision_gate 결과를 사후 기록 — 현재 없음.
- **주의(계획 반영 완료):** Phase 0 재현 결과 clean ON이 §2 가정과 다른 지점(storage write/refresh-token/eviction/boot)에서 실패하면, 이 절에 재고정된 root cause와 그에 따른 설계 변경을 기록하고 coordinator decision_gate 승인 후 진행한다.

---

## 11. Plan review round 1 responses (codex.md 대응)

리뷰 verdict **NEEDS_REWORK**의 각 finding → 반영 위치 매핑.

| Finding                                          | 반영                                                                                                                                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1-1** ON root cause 미확정 + C1/C2 서술 충돌  | §5 **Phase 0**(필수 런타임 재현, 3 시나리오·기록 항목·재고정 게이트) 신설. §1 **C1 서술 교정**(BroadcastChannel event 전달 가능 인정 → 결함 본질은 싱글톤 storage/`getSession()`/API token source에 OFF 세션 미저장). **C2를 HYPOTHESIS로 강등**, Phase 0 전 adapter 착수 금지(§8). |
| **P1-2** multi-tab 정책 부재                     | §2 **Multi-tab 정책(decision)**: preference는 **브라우저 전역**, 탭별 상이 정책 미지원(제약 명시). ON/ON·ON/OFF·OFF/OFF·sign-out·token refresh·close/refresh 동작 규약 기술. §4 **V5b(3)** 에 multi-tab 시나리오, §8 제약 추가. `setItem` 반대편 미삭제로 교차 clobber 회귀 차단.   |
| **P1-3** legacy 양쪽 토큰 공존 미처리            | §2 **Legacy migration matrix**(local only/session only/both same/both different/neither → 선택·삭제·재인증 규칙). `both different`는 묵시 복원 금지 → 강제 재인증. getItem **no-fallback**. §4 V1에 매트릭스 테스트.                                                                |
| **P1-4** ON 복원 필수 증명 부재                  | **V5 → V5a(통합 테스트, 필수)** 승격: 실제 authStorage+client 저장→새 인스턴스 `getSession()` 복원. **V5b(수동 브라우저 증거, 필수 산출물)** 시나리오·경로·증거 파일 명시. §3/§7 test·evidence 경로 및 **file-count 재계산(핵심 8, 상한 10)**.                                      |
| **P2-1** storageKey 호환 암묵적                  | §8 **storageKey invariant**(기본값 미변경/동일 유지) 제약 추가. §2-1 명시. §4 V1에 flag 없이 기본 key local 복원 회귀 테스트 + 보조 키(`-code-verifier`/`-user`) 양쪽 removeItem 테스트. V5a 호환 검증.                                                                             |
| **P2-2** 로그인 실패 시 preference rollback 부재 | §2-2 + §5 Batch 2 **실패 시 이전 preference 롤백**(로그인 시작 시 이전 값 캡처). §4 **V2(c)** 실패 롤백 단언 추가.                                                                                                                                                                  |

> Scope manifest 관련: 리뷰 지적대로 통합 테스트/증거 경로를 §3·§7 manifest에 선반영하고 file-count 상한을 10으로 재계산. `.scv` 증거는 코드 파일이 아니므로 상한 제외·스테이징 금지.

---

## 12. Plan review round 2 responses (residual REQUEST_CHANGES 대응)

리뷰 round 2 verdict **REQUEST_CHANGES**의 residual finding → 반영 위치 매핑. (P1-3/P1-4/P2-2는 round 2에서 "충분히 반영"으로 판정됨.)

| Residual finding                                                   | 반영                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1-1** "clean ON 정상 ⇒ C2 확정" 판정 오류                       | §5 0-3을 **3-way 게이트**로 교체 — (1) 재현+dual-client 귀속→C2 확정, (2) 재현+다른 실패 지점→재고정 decision_gate, (3) **미재현→C2 미확정·"미재현" 기록·자동 Batch 1 진입 금지**. §1 **결론을 OFF(확정 C1) / ON(Phase 0 대기 hypothesis C2)로 분리**, §4 **H1→H1a(OFF 확정)/H1b(ON 가설)** 분리. §2 ⚠️ 노트도 3-way 게이트 참조로 갱신.                                                                                                                                                                                   |
| **P1-2** 다른 탭 OFF session이 sign-out으로 안 지워져 refresh 부활 | §2 Multi-tab **design lock**: `removeItem`은 현재 탭만 접근 가능하고 BroadcastChannel은 storage를 자동 삭제 안 함을 명시. **각 탭 `SIGNED_OUT` 콜백이 `clearAllAuthStorage()`로 양쪽 백엔드 자기 정리** → refresh 부활 차단. `auth-store.ts`를 **필수 scope로 승격**(§3·§7, 핵심 8→9). OFF는 tab-local(memory 일시/​storage authoritative)로 규정. §4 **V5b(3)를 pass/fail 단언**으로 고정(다른 탭 sign-out→refresh 후 `/login`, OFF sign-in 수신 탭 memory/storage 일치). 이전의 잘못된 "잘못 복원되지 않는다" 문장 삭제. |
| **P2-1** stale 정리 auth key 식별 모호(glob 위험)                  | §2-1 **공유 상수 `AUTH_STORAGE_KEY`**(VITE_SUPABASE_URL→supabase-js 규칙 유도)를 client `storageKey`·정리 helper가 공유. §2-4 정리는 **정확 main key+정의 suffix만**, prefix/wildcard scan 금지, 무관 `sb-<other-ref>-auth-token` 절대 미삭제. §4 **V1에 다른-ref key 보존 + key 유도 단언** 추가. §8 invariant 갱신.                                                                                                                                                                                                      |

**Optional residual notes(반영):**

- **V5a flaky 완화:** deterministic `fetch` stub + test JWT/session fixture + `autoRefreshToken: false`(또는 timer 정리) — §4 V5a·§5 Batch 3(7).
- **V5b tab close vs browser session restore 구분:** §4 V5b(2)에 (a) 정상 close 후 새 탭 / (b) 브라우저 session restore 별도 기록.
- **preference 전환 ↔ rollback race:** §4 V5b(4)에 다른 탭 token refresh가 끼는 race 최소 1회 관찰·기록(§P2-2 residual risk).

> Scope 재계산: 핵심 **9개**(auth-store.ts 승격 포함), 조건부 **1개**(app.tsx), 하드 상한 **10개**(변동 없음). auth-store 정리 로직은 공유 helper 호출이라 V1+V5b로 커버 → 테스트 파일 수 불변.
