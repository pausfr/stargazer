# Code Generation Plan — u1-astronomy

## Summary

- Builds: 달 조도·박명·완전한 밤·월출/월몰을 계산하는 순수 TypeScript 라이브러리(U1), C1 계약(computeAstronomy)을 구현
- Touches: `src/astronomy/`(계산 모듈·타입), `src/astronomy/__tests__/`(단위 테스트), `package.json`·`tsconfig.json`·`vitest.config.ts`(러너 설정, 전체 번들 공용 최소본)
- Tests: Vitest 단위 테스트 약 12~16개(조도·박명/완전한 밤·월출/월몰·KST 변환·입력 검증), 핵심 계산 모듈 ~80% 라인 커버리지

> 단위 U1 u1-astronomy (kind: library). 근거: functional-design(entities/rules/functional-spec), nfr-design(security-design), contract-summary(C1), tech-stack-decisions. test-after·standard 전략, 핵심 계산 모듈 80% 커버리지 플로어(team.md).
> u1은 순수·결정론적 계산 라이브러리이므로 적용 테스트 레이어는 "Business logic"뿐(data model/repository/API/frontend 미적용). UI·외부 API 연동은 다른 단위 소관.

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

## 구현 스텝

test-after 방법론: 적용 레이어(u1은 Business logic만)를 먼저 구현한 뒤 그 레이어의 단위 테스트를 작성·실행한다. data model/repository/API/frontend 레이어는 u1(순수 계산 라이브러리)에 미적용이라 생략한다(천문 계산 자체가 비즈니스 로직 레이어).

- [x] **Step 1 — 프로젝트 구조·프로덕션 설정 스켈레톤**: 정적 앱 전체가 공유할 최소 TypeScript 프로젝트 골격을 `src/` 루트에 둔다. `package.json`(TypeScript, Vitest, 천문 라이브러리 의존), `tsconfig.json`(strict), Prettier+ESLint 설정(team.md Code Style). u1 코드는 `src/astronomy/`에 배치.
- [x] **Step 2 — 테스트 러너 부트스트랩**: Vitest 설정(`vitest.config.ts`)과 커버리지 리포터를 두고, u1 단위 테스트만 돌리는 정확한 명령을 `unit-test-instructions.md`에 기록한다. 첫 테스트 작성 전에 러너가 실행 가능해야 함.
- [x] **Step 3 — Business logic 구현 (천문 계산)**: C1 계약대로 `src/astronomy/`에 구현.
  - `types.ts`: `AstronomyInput`, `AstronomyResult`, `TwilightWindow`(start/end nullable), `AstronomyComputationError`(entities.md, C1 갱신 반영)
  - `validation.ts`: 입력 검증 게이트(SD1 — dateKstId 형식·실재 날짜, lat/lon 범위, night 경계 쌍 일관성), 실패 시 AstronomyComputationError (BR5.1)
  - `night-range.ts`: "그날 밤" 기본 범위 산출(입력 없을 때 18:00~익일 06:00, BR3.2)
  - `astronomy.ts`: `computeAstronomy()` — 천문 라이브러리로 달 조도(BR1.1)·박명 3종(BR2.1)·완전한 밤(BR2.2)·월출/월몰("그날 밤" 범위 판정, BR3.1) 계산, UTC 내부 계산 후 KST ISO 변환(BR4.2), 표시 반올림(BR4.1). (US3.1·US3.2·US4.2의 값 산출)
  - 천문 라이브러리 선정: tech-stack-decisions 1순위(astronomy-engine류, 무료·키 불필요). Step 3에서 실제 패키지를 확정해 `package.json`에 추가.
- [x] **Step 4 — Business logic 테스트 작성·실행 (test-after)**: `src/astronomy/__tests__/`에 Vitest 단위 테스트. 알려진 날짜의 기준값(신월/보름 조도, 박명 시각, 월출/월몰 유무)으로 검증. happy-path + 최소 2개 엣지(완전한 밤 미성립 → null 쌍, 월출/월몰 그날 밤 범위 밖 → null, 유효하지 않은 입력 → 오류). 핵심 계산 모듈 ~80% 라인 커버리지 확인.
- [x] **Step 5 — 환경/빌드 설정**: u1이 전체 번들에 트리셰이킹되도록 export 정리(`src/astronomy/index.ts`). 비밀값 없음 확인(NFR6).
- [x] **Step 6 — 문서·추적성**: 공개 함수 인라인 JSDoc, `code-summary.md`·`source-manifest.json`·`traceability.json` 작성(Step 5 산출물은 조정자가).

## 스토리 → 코드 스텝 추적

| 스토리/수용기준 | 구현 스텝 | 규칙 |
|-----------------|-----------|------|
| AC1.3.1·AC2.1.1·AC2.1.3·AC3.1.1 (달 조도) | Step 3 astronomy.ts | BR1.1 |
| AC3.1.2 (박명·완전한 밤) | Step 3 astronomy.ts | BR2.1, BR2.2 |
| AC3.2.1·AC3.2.3 (완전한 밤·월출/월몰) | Step 3 astronomy.ts, night-range.ts | BR2.2, BR3.1, BR3.2 |
| AC4.2.1·AC4.2.2 (계산 실패·재시도) | Step 3 validation.ts | BR5.1 |
| NFR6.1·NFR6.2·NFR6.3 (보안·입력검증) | Step 3 validation.ts, types.ts | SD1, SD2 |

## 비고

- NFR Design `logical-components`대로 `computeAstronomy`를 유일한 public 진입점으로, 내부 계산 함수와 천문 라이브러리 접근을 캡슐화한다.
- Step 1·2의 러너 설정은 전체 앱 공용 최소본이다. 이후 단위(U2~U4)가 같은 설정을 재사용한다.
