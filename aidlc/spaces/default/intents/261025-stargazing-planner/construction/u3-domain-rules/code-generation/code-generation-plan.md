# Code Generation Plan — u3-domain-rules

## Summary

- Builds: 달력 + 추천 판정 도메인 규칙 라이브러리(`src/domain-rules/`) — 주말·공휴일 연휴 날짜 산출(내장 공휴일 테이블), 밤 단위 추천 판정(3-상태: recommended/not_recommended/deferred).
- Touches: `src/domain-rules/{types,constants,holidays,calendar,recommend,index}.ts` 신규 생성; `src/domain-rules/__tests__/domain-rules.test.ts` 신규.
- Tests: Vitest 단위 테스트 약 20~26개(공휴일 테이블·연휴 묶음·3개월 범위·추천 3분기·임계값 경계·deferred), 모두 결정적(시각·입력 주입).

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

## 방법론 적용(test-after)

레이어별로 구현한 뒤 그 레이어 단위 테스트를 작성·실행한다. U3는 순수 규칙 라이브러리이므로 테스트 가능 레이어를 이 단위에 맞게 매핑: 데이터 모델(types)·상수(constants)·공휴일 테이블(holidays)·달력(calendar)·추천(recommend). "API/endpoint"와 "Frontend behavior"는 U3에 해당 없음 → 생략. 외부 I/O·네트워크 없음(순수 계산), 시각·입력 주입으로 결정성 확보.

## 구현 단계 (스토리→코드 추적)

- [x] **Step 1 — 프로젝트 구조/설정 스켈레톤.** `src/domain-rules/` 디렉터리. U1·U2 루트 설정(package.json·tsconfig·vitest.config·.prettierrc·eslint) 재사용, 신규 의존성 없음(날짜 연산은 내장 Date 우선). U1 index(`src/astronomy`)·U2 index(`src/weather`)에서 타입 import(C1·C2). (US1.1~US1.3, US2.x)

- [x] **Step 2 — 테스트 러너 준비.** 기존 Vitest 재사용 확인. 유닛 범위 명령 기록: `npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'`. 첫 테스트 전 실행 가능 확인. (NFR 테스트 가능성)

- [x] **Step 3 — 데이터 모델 구현 (`src/domain-rules/types.ts`).** DateRange{fromKstId,months≥3}, CalendarDate{dateKstId,label,isHoliday,isWeekend,holidayCoverage,nightStartKst,nightEndKst,holidayGroupId?}, HolidayCoverage('covered'|'outOfTable'), Recommendation{dateKstId,verdict,reason?,moonIlluminationPct,cloudConsidered}, RecommendationVerdict('recommended'|'not_recommended'|'deferred'). C1(AstronomyResult)·C2(CloudForecast) 타입은 U1·U2 index에서 import. (C3, entities.md)

- [x] **Step 4 — 데이터 모델 테스트.** 타입 생성 헬퍼/가드의 기본 불변식(verdict enum, holidayCoverage enum). (entities.md)

- [x] **Step 5 — 상수 구현 (`src/domain-rules/constants.ts`).** MOON_ILLUMINATION_MAX_PCT=20, CLOUD_MAX_PCT=30(BR2.5), 공휴일 테이블 커버 연도 범위 상수(HOLIDAY_TABLE_FROM_YEAR·TO_YEAR), 밤 구간 구름 집계 방식(평균). 계산과 분리(SD3, ADR-002). (BR2.5, NFR-U3-MAINT.1)

- [x] **Step 6 — 공휴일 테이블 구현 (`src/domain-rules/holidays.ts`).** 내장 한국 법정공휴일 + 대체공휴일 테이블(커버 연도 범위). `isHoliday(dateKstId)` → covered 범위면 테이블 조회, 범위 밖이면 outOfTable 표시(BR1.5). 네트워크 없음. (BR1.5, SD3)

- [x] **Step 7 — 공휴일 테이블 테스트.** 범위 내 공휴일 적중/비적중, 대체공휴일, 범위 밖 연도 → outOfTable(주말만). (BR1.5)

- [x] **Step 8 — 달력 구현 (`src/domain-rules/calendar.ts`).** WF1 `listCandidateDates(range)`: 범위 전개 → 주말/공휴일 분류(holidayCoverage 포함) → 후보 선별(공휴일 없으면 주말만, BR1.2) → 밤 범위(nightStart/End, KST) 부여(BR1.3) → 연속 묶음(holidayGroupId·라벨, BR1.4). 입력 검증 게이트(months≥3·fromKstId 형식, 예외 없이, SD1). 기준일은 주입 가능. (BR1.1~1.5, SD1)

- [x] **Step 9 — 달력 테스트.** 3개월 범위 주말·공휴일 산출, 공휴일 없을 때 주말만, 연휴 묶음 그룹핑, 밤 범위, 범위 밖 연도 outOfTable, months<3 보정/거부. (BR1.1~1.5)

- [x] **Step 10 — 추천 구현 (`src/domain-rules/recommend.ts`).** WF2 `recommend(astro, cloud)`: 분기 우선순위(SD1 fix) — cloud.status 분기 먼저(unknown→deferred, outOfHorizon→조도만), 그다음 조도 비정상 보정. known이면 밤 구간 구름 집계(평균, 데이터 없으면 deferred) → 조도≤20% AND 구름≤30%면 recommended, 아니면 not_recommended. 입력 방어(조도 0~100), 예외 없이. (BR2.1~2.6, SD1·SD2)

- [x] **Step 11 — 추천 테스트.** known 추천/비추천(조도·구름 경계 20/30), outOfHorizon 조도만, unknown→deferred, known이나 밤 구간 데이터 없음→deferred, 비정상 조도 + unknown → deferred 유지(우선순위 보존). (BR2.1~2.6)

- [x] **Step 12 — 공개 인덱스 (`src/domain-rules/index.ts`).** listCandidateDates, recommend, 공개 타입(CalendarDate·Recommendation·RecommendationVerdict·DateRange), 상수(임계값·커버 범위) 재노출. (C3)

- [x] **Step 13 — 환경/빌드 확인.** `npx tsc --noEmit` 통과, `src/domain-rules` 커버리지 ≥ 80% 확인, 비밀값 없음 확인. (NFR6.1, 커버리지 플로어)

- [x] **Step 14 — 문서화·추적성.** 공개 함수 인라인 doc. `code-summary.md`·`source-manifest.json`·`traceability.json`은 조정자(Step 5)가 작성.
