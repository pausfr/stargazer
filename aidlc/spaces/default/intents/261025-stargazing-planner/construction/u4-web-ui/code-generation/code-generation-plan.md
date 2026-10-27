# Code Generation Plan — u4-web-ui

## Summary

- Builds: 다크모드 모바일 우선 웹 앱의 **번들 진입점** — 메인 연휴 카드 목록·상세 이중축 그래프 2화면, U1·U2·U3을 점진 조립하는 NightViewAssembler, 공유 캐시를 쥔 AppRoot. 전체 단일 정적 번들을 Vite로 묶는다. 전용 스타일시트 `src/web-ui/styles.css`로 카드·추천 강조·상세·차트 영역·반응형을 실제로 그린다. **이번 재작업(2차 반려 보완): (5) 상세 좌y축을 수평 기준선 대신 달 체감 밝기 시간별 꺾은선(C1 `moonHourly` 확장·U1 계산)으로, (2) X축을 epoch 원본값 대신 KST "HH:MM" 표시로, (6) U1 월출·월몰 비대칭 버그 수정, (7/8) 박명 음영을 구간별 농도 차등+라벨로, (3) 상세 "월몰 월몰 없음" 중복 제거.**
- Touches: U4 `src/web-ui/{types,state,assembler,recommendationView,listView,detailView,summaryView,chart,app,index}.ts` + `src/web-ui/styles.css` + `index.html`·`src/main.ts`; **U1 `src/astronomy/types.ts`(C1 `moonHourly` 확장)·`src/astronomy/astronomy.ts`(시간별 체감 밝기 계산, `computeMoonRiseSet` 비대칭 버그 수정)**; `vite.config.ts`·`package.json`; `src/web-ui/__tests__/*.test.ts` + `src/astronomy/__tests__/*` 보강.
- Tests: Vitest 단위 테스트 — U4 순수 로직(상태 매핑·assembler 조립·추천 표시 매핑·내부 사유 비노출·요약 null→"없음")에 더해 **U1 `moonHourly` 체감 밝기 곡선(남중=100%·고도≤0→0·대기소광 단조성)과 `computeMoonRiseSet` 대칭(월출 있으면 월몰도 탐색) 회귀 테스트**. 핵심 계산 모듈(u1) 80% 라인 커버리지 플로어 유지, U4 렌더·스타일은 수동 스모크.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "각 테스트 가능한 레이어(천문 계산 함수, 데이터 페치·캐시, 밤 추천 점수 산출)를 먼저 구현한 뒤 그 레이어의 단위 테스트를 작성하고 실행한다.",
  "scope": "feature",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: 각 테스트 가능한 레이어(천문 계산 함수, 데이터 페치·캐시,\n  밤 추천 점수 산출)를 먼저 구현한 뒤 그 레이어의 단위 테스트를 작성하고\n  실행한다.\n- **Methodology evidence**: 솔로 개발자가 무료 티어 정적 웹 앱을 만드는\n  맥락에서 TDD/BDD/ATDD의 사전 시나리오 작성 오버헤드보다, 정답이 분명한\n  순수 계산 로직(달 조도·박명·월출몰·추천 점수)에 대한 구현 후 단위 테스트가\n  비용 대비 가치가 높다고 인터뷰(Q3)에서 판단했습니다. feature 스코프이며\n  org.md 기본과 동일한 test-after를 채택합니다.\n- 전체적으로 가벼운 테스트 분량을 지향하되, 핵심 천문 계산 로직(달 조도,\n  박명 구간/완전한 밤, 월출·월몰, 밤 추천 점수)에 테스트 노력을 집중합니다.\n  UI와 외부 API 연동은 수동 스모크로 보완합니다.\n- **커버리지**: 약 80% 라인 커버리지 플로어는 **핵심 계산 모듈에만** 적용하고\n  (Q4), UI 등 그 외 코드는 더 느슨하게 둡니다."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:243d22208dc995e40909cf6aa51337e081d5f273441223117e7d4123bf5a1ca0",
  "contract_sha256": "sha256:475eee0f91c09aa167514fd0761c666d4fb4818de670c303b6209ad18048c3ab"
}
```

## 방법론 적용 (test-after)

레이어별로 구현한 뒤 그 레이어 단위 테스트를 작성·실행한다. u4는 표시 전용 UI 단위이므로 `plan_profile`의 테스트 가능 레이어를 이 단위에 맞게 매핑한다:

- **Data model** → 표시 뷰모델 타입(NightView·상태 enum, `src/web-ui/types.ts`). 순수 로직 테스트.
- **Repository / data access** → 해당 없음(u4는 저장·DB 없음; 외부 접근은 U2에 위임). 생략.
- **Business logic** → NightViewAssembler(§2 조립·상태 산출)·상태 매핑 계층(내부 사유 비노출). u4의 테스트 집중 대상(mock U1/U2/U3로 결정적 테스트).
- **API / endpoint** → 해당 없음(백엔드·엔드포인트 없음). 생략.
- **Frontend behavior** → 추천 표시 매핑(강조 플래그·라벨)·상태→표시 문구 매핑 등 **순수 함수로 분리 가능한 UI 로직**만 단위 테스트. 실제 DOM 렌더링·Chart.js 그리기는 수동 스모크(team.md: UI는 80% 플로어 비대상).

**커버리지 방침(중요, team.md Q4·project.md 학습):** 80% 라인 커버리지 플로어는 **핵심 계산 모듈(u1/u2/u3)에만** 적용되며 **u4(UI)에는 적용하지 않는다**. 이는 정의된 품질 목표를 낮추는 것이 아니라, 팀이 확정한 "플로어는 핵심 계산 모듈 전용" 규칙을 그대로 따르는 것이다. u4는 순수 로직(assembler·상태/표시 매핑)에 단위 테스트를 집중하고 렌더링은 수동 스모크로 보완한다.

## 구현 단계 (스토리→코드 추적)

- [ ] **Step 1 — 프로젝트 구조/번들 스켈레톤.** `src/web-ui/` 디렉터리, `index.html`(다크모드 기본 테마·모바일 뷰포트), `src/main.ts`(브라우저 진입점 → AppRoot 마운트). 루트 설정 재사용(tsconfig·eslint·prettier). 번들러 **Vite** 도입: `vite.config.ts` 신규, `package.json`에 `vite`·`chart.js`·`chartjs-plugin-annotation`·(테스트용)`happy-dom` devDependency 추가. 비밀값 없음(NFR6.1). (US1.1~US4.2, 번들 진입점)

- [ ] **Step 2 — 테스트 러너 준비.** 기존 Vitest 재사용. u4 순수 로직은 node 환경으로 충분하되, DOM touch가 필요한 테스트는 파일 상단 `// @vitest-environment happy-dom`로 한정(루트 config의 node 기본 유지, 핵심 계산 모듈 측정에 영향 없음). 유닛 범위 명령 기록: `npx vitest run src/web-ui`. 첫 테스트 전 실행 가능 확인. (NFR 테스트 가능성)

- [ ] **Step 3 — 데이터 모델(뷰모델) 구현 (`src/web-ui/types.ts`).** `NightView{calendar,astro|error,cloud,verdict,state}`, `ViewState = 'loading'|'ok'|'partial'|'error'`, `DEFAULT_LOCATION = { lat: 37.5665, lon: 126.9780 }`. C1(AstronomyResult)·C2(CloudForecast)·C3(CalendarDate·Recommendation)는 `src/astronomy`·`src/weather`·`src/domain-rules` index에서 import(소유 아님). (functional-spec §2·§2.1, C1·C2·C3)

- [ ] **Step 4 — 데이터 모델 테스트.** ViewState enum·NightView 조립 결과 형태 가드(기본 불변식). (functional-spec §2)

- [ ] **Step 5 — 비즈니스 로직 구현: 상태 매핑 (`src/web-ui/state.ts`).** `mapState(astro, cloud)` → §5 상태머신: 천문 실패→error, 천문 OK·날씨 known→ok, 날씨 unknown→partial, 날씨 outOfHorizon→ok(+먼 날짜 안내). 내부 사유(C2 `reason`, `AstronomyComputationError.code`) 차단·중립 문구 매핑(SD3). 순수 함수. (FR6.1~6.3, §5, SD3)

- [ ] **Step 6 — 상태 매핑 테스트.** 4상태 전이 전부 + 내부 사유 비노출(중립 문구만) 검증. (FR6.1~6.3, SD3)

- [ ] **Step 7 — 비즈니스 로직 구현: 조립 (`src/web-ui/assembler.ts`).** `NightViewAssembler`: 즉시 단계 `computeAstronomy({dateKstId,lat,lon,nightStartKst,nightEndKst})`(밤 범위 전달 필수, §2.1) → 지연 단계 `await getCloudForecast({dateKstId,lat,lon},{nowMs,cache})` → `recommend(astro,cloud)` → `mapState`. 공유 `cache`·`nowMs` 주입받음(PD1·PD3). astro throw는 error로 격리. 순수·주입 기반(결정성). (functional-spec §2·§2.1·§5.1, PD1·PD3)

- [ ] **Step 8 — 조립 테스트.** mock U1/U2/U3로: 즉시 단계 천문 우선, known/unknown/outOfHorizon/astro-throw 각 경로의 state·verdict 결과, nightStart/End를 computeAstronomy에 전달하는지, 같은 cache 주입 재사용. (PD1·PD3, §2.1)

- [ ] **Step 9 — Frontend 로직 구현: 추천 표시 매핑 (`src/web-ui/recommendationView.ts`).** `recommend.verdict`만 읽어 카드 강조 속성 산출: recommended → {노란 테두리, 별 아이콘, "추천" 라벨}(색 비의존, NFR1·AC2.1.4), not_recommended/deferred → 강조 없음(deferred는 제외 안 함·뒤로 정렬). UI는 임계값/판정 로직을 갖지 않는다(U3 소유). 순수 함수. (FR2.1, NFR1, AC2.1.1~2.1.4)

- [ ] **Step 10 — 추천 표시 매핑 테스트.** 3 verdict → 강조 플래그/라벨/아이콘 매핑, 색 비의존(아이콘+라벨 병행) 검증. (FR2.1, AC2.1.4)

- [ ] **Step 11 — Frontend 렌더 구현: 메인 목록 (`src/web-ui/listView.ts`).** WF1: 스켈레톤 → `listCandidateDates` → 날짜별 NightView를 `Promise.all` 병렬 조립(PD2) → 카드 렌더(날짜/연휴명·달 아이콘+조도%·구름 요약 또는 안내) → 추천 강조(Step 9) → 카드 탭 시 상세 이동(dateKstId). 빈 목록 안내. `data-testid` 부여. 다크모드·모바일 우선. (FR1.1~1.4, FR2.1, US1.x, AC1.x)

- [ ] **Step 11.5 — [U1 재작업] C1 `moonHourly` 확장 + 시간별 체감 밝기 계산 (`src/astronomy/types.ts`, `src/astronomy/astronomy.ts`).** (5번) `AstronomyResult`에 `moonHourly: { hourKst: string; altitudeDeg: number; relativeBrightnessPct: number }[]` 추가(기존 `moonIlluminationPct` 위상 스칼라는 카드·요약용으로 유지). 밤 범위를 약 30분 간격으로 샘플링해 각 시각의 달 고도를 구하고, 체감 밝기 = 위상 조도 스케일 × sin(고도) × 대기소광(airmass) 보정으로 산출한다. **남중(실제 천문 남중 고도 기준, 밤 범위 밖이어도 참조)에서 100%로 정규화**, 고도 ≤ 0이면 0%. 결정적 계산(시각 세부 비의존, KST 기준). (C1 확장, functional-spec §2.1)

- [ ] **Step 11.6 — [U1 재작업] `computeMoonRiseSet` 비대칭 버그 수정 (`src/astronomy/astronomy.ts`).** (6번) 현재 월출·월몰을 모두 `range.startUtc`에서 한 번만 전방 탐색해 "월출은 있는데 월몰은 없음"이 생기는 비대칭을 고친다. 월출을 찾으면 그 이후 구간에서 월몰을 탐색하고(또는 밤 범위 전체를 커버하도록 탐색 창을 대칭화), 둘 다 null 가능성은 유지하되 "하나만 있는" 인공적 결과가 나오지 않게 한다. 회귀 테스트로 대칭성 고정. (functional-spec §2.1, AC3.2.3)

- [ ] **Step 11.7 — [U1 재작업] U1 회귀 테스트 (`src/astronomy/__tests__`).** `moonHourly`: 남중 시각 ≈ 100%, 고도 ≤ 0 시각 = 0%, 월출→남중 구간 단조 증가·남중→월몰 단조 감소(대기소광 단조성), 월출/월몰 근처 남중 대비 낮음(≈ ≤ 수 %). `computeMoonRiseSet`: 월출이 있으면 같은 밤에 월몰도 탐색됨(비대칭 재발 방지). 핵심 계산 모듈 커버리지 플로어 유지. (C1, functional-spec §2.1)

- [ ] **Step 12 — Frontend 렌더 구현: 차트 래퍼 (`src/web-ui/chart.ts`).** Chart.js + annotation 플러그인 래퍼. (5번) **좌y축: 달 체감 밝기 시간별 꺾은선** — `astro.moonHourly`를 시계열로 그린다(수평 기준선 아님; 월출·남중·월몰에 따라 시간 단위로 변함, 남중=100%). (2번) **X축: 표시용 KST "HH:MM"** — 계산용 epoch ms는 내부로 두고, `ticks.callback`(또는 time scale 포맷터)으로 "19:00","23:00" 같은 KST 시:분으로 렌더(epoch 원본값 노출 금지). 우y축: 구름량 곡선(known만). (7/8번) **박명 음영 구간별 농도 차등+라벨**: 시민<항해<천문<완전한 밤 순으로 점점 어둡게(시민 밖은 밝게) annotation box 배경 alpha를 차등 적용하고, 각 음영에 구간 라벨(시민/항해/천문 박명)을 box 안에 표시해 가시성을 확보한다. 경계 null이면 해당 box 생략. 다크 배경 색·범례. 단일 인스턴스 data 갱신(PD4). (FR3.2·3.3·3.5, §2.1·§4, PD4)

- [ ] **Step 13 — Frontend 렌더 구현: 상세 화면 (`src/web-ui/detailView.ts`, `src/web-ui/summaryView.ts`).** WF2: 로딩 → NightView 조립 → astro 실패 시 에러+재시도(WF3) → 차트 렌더(Step 12) → 핵심 숫자 요약(완전한 밤·월출·월몰) → 범례 → 뒤로가기(이전/다음 연휴 버튼 없음). (3번) **요약 행의 "월몰 월몰 없음" 중복 제거**: 요약은 라벨(예: "월몰")과 값을 각각 렌더하므로, 값에는 라벨을 반복하지 않는다 — `moonset`이 null이면 값은 "없음"만(라벨 "월몰" + 값 "없음" → "월몰 없음"), 월출·완전한 밤도 동일 규칙(값은 "없음"만, 라벨 중복 금지). `moonrise`/`moonset`/완전한 밤 경계가 null이면 생략하지 않고 "없음"으로 명시(AC3.2.3). `data-testid` 부여. (FR3.1~3.6, FR6.2, US3.x·US4.2, AC3.x·AC4.2)

- [ ] **Step 14 — Frontend 로직 테스트 (happy-dom).** 요약 숫자 null→"없음" 매핑(라벨 중복 없음: "월몰 없음"이지 "월몰 월몰 없음"이 아님 — 3번 회귀), outOfHorizon "먼 날짜" 안내 문구, partial "구름량 알 수 없음" 문구 등 **순수 표시 매핑**과 재시도 상태 전이. 차트 X축 KST "HH:MM" 포맷 함수가 분리 가능하면 그 순수 변환(epoch→"HH:MM" KST)도 단위 테스트(2번). 실제 Chart.js 그리기는 제외(수동 스모크). (FR3.4, FR6.1, §5)

- [ ] **Step 15 — AppRoot·공개 인덱스 (`src/web-ui/app.ts`, `src/web-ui/index.ts`).** AppRoot: 공유 `DataCache` 단일 인스턴스(U2 타입)·`nowMs` 보유, 모든 getCloudForecast 호출에 주입(PD3), 라우팅(목록↔상세, 뒤로가기). `index.ts`로 공개 표면 재노출. `src/main.ts`가 AppRoot를 `#app`에 마운트하고 `styles.css`를 import. (functional-spec §5.1, logical-components)

- [ ] **Step 15.5 — 전용 스타일시트 (`src/web-ui/styles.css`) [반려 보완, frontend-components §5.5].** 각 뷰가 부여하는 className에 실제 스타일 규칙을 1:1로 작성한다(이전 반려 원인: className만 있고 CSS 없음 → 맨 텍스트). index.html의 CSS 변수(`--bg`·`--surface`·`--surface-2`·`--text`·`--text-dim`·`--border`·`--accent`·`--accent-text`·`--danger`)를 사용. 포함 규칙:
  - `.card` — `--surface` 배경·`--border` 테두리·라운드·패딩·카드 간 간격·탭 커서; 날짜/연휴명·달 조도·구름 요약 정렬(모바일 세로 스택)
  - `.card.recommended` — `--accent` 2px 테두리 + 별 아이콘 + "추천" 라벨(색 비의존, NFR1·AC2.1.4); `.badge-recommend` 배지 스타일
  - `.moon-illum`·`.cloud-summary` — 보조 텍스트(`--text-dim`); `.skeleton` — shimmer(prefers-reduced-motion 존중); `.empty-state` — 중앙 안내
  - `.detail`·`.summary`/`.summary-row`(라벨-값, "없음" 동일 스타일)·`.legend`(색 견본+텍스트)
  - `.chart-container` — **고정 높이(약 320px)·100% 폭 명시**(Chart.js canvas 부모 높이 의존, 미지정 시 안 보임)
  - `.notice`/`.notice-far` — 중립 톤 안내; `.error`(`--danger`)·`.btn-retry`/`.btn-back` — 버튼 형태·탭 타깃 ≥44px·`:focus-visible`
  - 반응형: 모바일 세로 1열 기본, `#app` max-width 안 데스크톱 비파괴(NFR2); 다크 배경 대비·색 비의존
  - 안전 렌더 유지: class 토글로만 적용, 문자열은 계속 `textContent`(innerHTML 금지, NFR6.2)
  스타일시트 없는 산출물은 미완성으로 본다. (FR1.3·FR2.1, NFR1·NFR2, AC2.1.4)

- [ ] **Step 16 — 환경/빌드 확인.** `npx tsc --noEmit` 통과, `npx vite build` 성공(정적 번들·styles.css 포함 산출), 비밀값 없음 확인, `src/web-ui` 테스트 green. **U1 재작업(moonHourly·월출몰 수정) 후 핵심 계산 모듈(u1) 커버리지 플로어를 `--coverage.include='src/astronomy/**'`로 측정해 유지(루트 집계 희석 회피, project.md 학습).** u4(UI)는 플로어 비대상. (NFR6.1, NFR7, 빌드)

- [ ] **Step 17 — 문서화·추적성.** 공개 함수·뷰 인라인 doc. `code-summary.md`·`source-manifest.json`·`traceability.json`은 조정자(Step 5)가 작성.

## 품질 목표 (낮추지 않음)

- NFR6.1 비밀값 비포함, NFR6.2 안전 렌더(텍스트 바인딩·innerHTML 미사용), NFR6.3 내부 사유 비노출은 구현에서 반드시 지킨다.
- 핵심 계산 모듈(u1/u2/u3)의 80% 라인 커버리지 플로어는 이 UI 단위 작업으로 인해 낮추거나 비활성화하지 않는다. u4는 플로어 대상이 아니며(team.md Q4), 순수 로직 테스트로 가볍게 커버한다.
