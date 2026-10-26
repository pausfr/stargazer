# Code Generation Plan — u2-weather-data

## Summary

- Builds: 구름량 예보 데이터 접근 라이브러리(`src/weather/`) — Open-Meteo 호출, 3-상태 정규화(known/outOfHorizon/unknown), TTL 메모리 캐시, 14일 사전 컷오프.
- Touches: `src/weather/{types,validation,cache,client,weather,index}.ts` 신규 생성; `src/weather/__tests__/weather.test.ts` 신규.
- Tests: Vitest 단위 테스트 약 18~24개(검증 게이트·3-상태 정규화·TTL 캐시·컷오프·타임아웃), 외부 API는 네트워크 없이 스텁/페이크로 테스트.

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

레이어별로 구현한 뒤 그 레이어의 단위 테스트를 작성·실행한다. U2는 라이브러리이므로 테스트 가능 레이어를 이 단위에 맞게 매핑한다: 데이터 모델(types)·검증 게이트(validation)·캐시(cache)·외부 어댑터(client)·오케스트레이션(weather). "API/endpoint"와 "Frontend behavior" 레이어는 U2(데이터 라이브러리)에 해당 없음 → 생략. 외부 네트워크 호출은 테스트에서 스텁/페이크로 대체한다(실제 API 미호출, Q3 결정).

## 구현 단계 (스토리→코드 추적)

- [x] **Step 1 — 프로젝트 구조/프로덕션 설정 스켈레톤.** `src/weather/` 디렉터리 생성. U1에서 만든 루트 `package.json`·`tsconfig.json`·`vitest.config.ts`·`.prettierrc.json`·`eslint.config.js` 재사용(신규 의존성 없음 — Open-Meteo는 키 불필요 공개 API, `fetch`는 브라우저/Node 내장). (US1.3, US3.1, US4.1)

- [x] **Step 2 — 테스트 러너 준비.** 기존 Vitest 설정 재사용 확인. 유닛 범위 실행 명령 기록: `npx vitest run src/weather --coverage`. 첫 테스트 작성 전에 러너가 실행 가능함을 확인. (NFR 테스트 가능성)

- [x] **Step 3 — 데이터 모델 구현 (`src/weather/types.ts`).** `CloudStatus`('known'|'outOfHorizon'|'unknown'), `HourlyCloud`{hourKst,cloudPct}, `CloudForecast`{dateKstId,status,hourlyCloudPct?,reason?}, `CloudForecastQuery`{dateKstId,lat,lon}, `CacheEntry`{cacheKey,forecast,storedAtMs,ttlMs}. 상태 불변식을 보장하는 생성 헬퍼(`knownForecast`/`outOfHorizonForecast`/`unknownForecast`)로 "known이면 reason=null, unknown이면 hourlyCloudPct=null" 제약을 타입·런타임에서 보장. `FORECAST_HORIZON_DAYS = 14` 상수를 단일 지점에 분리(BR1.3 불변식 주석: Open-Meteo 예보 범위 ≥ 14일이어야 함; Open-Meteo forecast 범위는 최대 16일이므로 14 ≤ 16 성립). (C2, entities.md)

- [x] **Step 4 — 데이터 모델 테스트 작성·실행.** types 생성 헬퍼의 상태 불변식 테스트(known→hourly 채움·reason=null, outOfHorizon→둘 다 null, unknown→hourly=null·reason 존재). (BR2.2, C2)

- [x] **Step 5 — 검증 게이트 구현 (`src/weather/validation.ts`).** SD1: 진입점 입력 검증 게이트(fail-fast). `dateKstId` 형식(YYYY-MM-DD·실재 날짜), `lat∈[-90,90]`, `lon∈[-180,180]`. 예외를 던지지 않고 검증 실패를 호출부에 불리언/결과로 전달(상위 orchestration이 unknown(reason="invalid input")으로 정규화). (SD1, NFR6.2, BR2.1)

- [x] **Step 6 — 검증 게이트 테스트 작성·실행.** 유효 입력 통과, 잘못된 날짜 형식/비실재 날짜/좌표 범위 밖 각각 실패. (SD1, BR2.1)

- [x] **Step 7 — TTL 캐시 구현 (`src/weather/cache.ts`).** `DataCache`: `cacheKey(dateKstId+lat+lon)`로 메모리 Map 저장. `get(key, nowMs)` → TTL 미만이면 forecast 반환, 아니면 미스. `set(key, forecast, ttlMs, nowMs)`. TTL 정책: known/outOfHorizon 길게(예: 60분), unknown 짧게(예: 2분). 시각은 주입 가능한 `nowMs`로 테스트 결정성 확보. (BR3.1, SD 복원력)

- [x] **Step 8 — TTL 캐시 테스트 작성·실행.** 저장 후 TTL 이내 히트, TTL 초과 미스, unknown 짧은 TTL vs known 긴 TTL 차등 만료, cacheKey 좌표/날짜 구분. (BR3.1)

- [x] **Step 9 — 외부 어댑터 구현 (`src/weather/client.ts`).** SD2·SD3: `WeatherClient`가 Open-Meteo(키 불필요 공개 API)를 `fetch`+`AbortController` 타임아웃(수 초)으로 호출. `fetch`는 주입 가능(기본은 전역 fetch)해 테스트에서 네트워크 없이 스텁. 응답 파싱·검증 후에만 known으로 정규화; 실패/타임아웃/파싱불가/구름량 결측은 unknown(reason에 내부 사유). 외부 원형 응답/오류는 호출부에 노출하지 않음. 비밀값 없음(키 불필요). (SD2, SD3, BR2.1, BR2.2, BR4.1, NFR6.1·6.3)

- [x] **Step 10 — 외부 어댑터 테스트 작성·실행.** 스텁 fetch로: 성공+구름량→known, HTTP 오류→unknown, 타임아웃(AbortController)→unknown, 파싱불가 JSON→unknown, 구름량 필드 결측→unknown. 네트워크 미호출. (BR2.1, BR2.2, BR4.1)

- [x] **Step 11 — 오케스트레이션 구현 (`src/weather/weather.ts`).** WF1 `getCloudForecast(query, deps)`: ① 검증 게이트(실패→unknown reason="invalid input", 호출 안 함) ② 캐시 조회(히트→반환, BR3.1) ③ 14일 사전 컷오프(요청일 > 오늘KST+FORECAST_HORIZON_DAYS → 호출 없이 outOfHorizon, 긴 TTL 캐시, BR1.1) ④ 14일 이내→WeatherClient 호출(known/unknown, BR1.2·BR2.1) ⑤ 결과 TTL 캐시 후 반환. u2 자동 재시도 없음(BR3.2). `nowMs`·`fetch` 주입. (WF1, BR1.1·BR1.2·BR1.3·BR2.1·BR3.1·BR3.2)

- [x] **Step 12 — 오케스트레이션 테스트 작성·실행.** 캐시 히트 시 호출 없음, 14일+1일→outOfHorizon(fetch 미호출 단언), 14일 이내 성공→known, 14일 이내 실패→unknown, unknown 짧은 TTL 후 재진입 시 재호출, 잘못된 입력→unknown(호출 안 함). (WF1, WF2, BR 전반)

- [x] **Step 13 — 공개 인덱스 (`src/weather/index.ts`).** `getCloudForecast`, 타입(`CloudForecast`·`CloudStatus`·`CloudForecastQuery`·`HourlyCloud`), `DataCache`, `FORECAST_HORIZON_DAYS`를 재노출. 외부 API 원형 타입은 비노출(어댑터 경계, BR2.2). (C2)

- [x] **Step 14 — 환경/빌드 설정 확인.** `npx tsc --noEmit` 통과, `src/weather` 커버리지 ≥ 80%(핵심 계산/데이터 모듈 플로어, team.md Q4) 확인. 비밀값·키 하드코딩 없음 확인(project.md Forbidden). (NFR6.1, 커버리지 플로어)

- [x] **Step 15 — 문서화·추적성.** 각 공개 함수 인라인 doc 주석. `code-summary.md`·`source-manifest.json`·`traceability.json`은 조정자(Step 5)가 작성.
