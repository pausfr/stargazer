## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-26
**Iteration:** 1
**Verdict Dictated:** no

U3 u3-domain-rules(달력 + 추천 판정, kind: library)에 대한 적대적 리뷰. 계획(code-generation-plan.md)이 실제 생성 코드·테스트로 충실히 구현됐는지 검증 명령 실행 결과까지 근거로 삼았다.

### 검증 명령 실행 결과(근거)

| 명령 | 결과 | 해석 |
|---|---|---|
| `npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'` | 29 tests passed. Lines 97.35% (294/302), Branch 94% | 핵심 모듈 80% 플로어(team.md Q4) 충족. holidays/constants 100%, calendar 96.52%, recommend 96%, index.ts 0%(재노출 배럴) |
| `npx tsc --noEmit` | exit 0 | strict 타입 통과. 상류 타입(AstronomyResult·CloudForecast·HourlyCloud) import 필드 일치 |
| `npx eslint src/domain-rules` | exit 0 | 0 errors/warnings |

code-summary.md가 주장한 수치(29개 통과, 97.35%, tsc/eslint 클린)는 실제 실행으로 모두 확인됨.

### 적대적 검증으로 확인한 정합(결함 아님 — 반증 시도 후 통과)

- **C3 계약 정합**: `listCandidateDates(range: DateRange) => CalendarDate[]`, `recommend(astro, cloud) => Recommendation`, `RecommendationVerdict` enum 모두 시그니처·타입 일치. 추가 필드(holidayGroupId·holidayCoverage·moonIlluminationPct·cloudConsidered)는 contract-summary의 "additive 변경은 안전(소비자는 모르는 필드 무시)" 규칙에 부합하는 안전한 내부 확장.
- **상류 타입 대조**: recommend.ts가 쓰는 `astro.moonIlluminationPct`·`astro.fullDarkStart/End`·`cloud.status`·`cloud.hourlyCloudPct`·`h.hourKst`·`h.cloudPct`가 src/astronomy/types.ts·src/weather/types.ts의 실제 필드와 정확히 일치. 롤업 index(src/astronomy/index.ts·src/weather/index.ts)에서 타입 재노출 경로도 유효.
- **분기 우선순위(SD1·BR2.4)**: recommend에서 `unknown` 분기가 조도 보정보다 먼저(코드 1순위). 비정상(높은) 조도 + unknown 입력도 deferred를 유지함을 코드 추적과 주입 테스트(`moonIlluminationPct:95 + unknownCloud → deferred`)로 확인. not_recommended로 뒤집히지 않음.
- **임계값 경계**: 조도≤20·구름≤30이 `<=`로 recommended 쪽. 테스트(조도=20, 구름=30 → recommended) 확인.
- **밤 구간 구름 집계(BR2.6)**: fullDark 창이 성립하면 창 안 시각 평균, 전무/창 밖이면 전체 평균 폴백, 유효 샘플 0이면 null→deferred. 설계(functional-spec WF2·security-design SD1)와 일치.
- **입력 검증(SD1)**: 예외 없이 처리. `fromKstId`=실재하지 않는 날짜(2026-02-30)·형식 오류·null 입력 → 빈 목록. months<3 → 3 보정. 조도 NaN → 보수적 100(밝음). 모두 테스트·직접 주입으로 확인.
- **테스트 유의미성**: 29개 모두 의미 있는 단언을 가짐(항상통과·무의미 없음). 외부 네트워크 미호출(순수, 입력 주입). 커버리지 플로어 충족.
- **traceability**: OK 타깃 파일이 모두 실재(calendar.ts·recommend.ts·holidays.ts·constants.ts·테스트). rules.md의 BR1.1~1.5·BR2.1~2.6 전부 수록, 누락 BR 없음.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | src/domain-rules/holidays.ts > HOLIDAY_ENTRIES 2026 추석 블록 | 2026 추석(9/24목·9/25금·9/26토) 중 9/26이 토요일과 겹치는데 대체공휴일이 테이블에 없다. 같은 테이블은 토요일과 겹친 광복절(8/15토→8/17월)·개천절(10/3토→10/5월)에는 대체공휴일을 넣었으므로, 추석에만 규칙을 적용하지 않은 내부 불일치다. 결과적으로 9/28(월)이 후보 밤에서 빠지고 추석 연휴 묶음이 짧게 산출된다. 이 앱의 핵심 가치인 "연휴 비교"의 대표 연휴(추석)에 직접 영향. | 2026 추석 대체공휴일 9/28(월)을 테이블에 추가하거나, 추석에 대체공휴일을 두지 않은 근거(규칙 적용 기준)를 코드 주석·code-summary에 명시해 광복절·개천절 처리와의 불일치를 해소하라. 함께 2024·2025·2027 추석·설날의 토·일 겹침 대체 규칙 적용 여부도 같은 기준으로 재확인하라. | New |
| R-02 | Minor | src/domain-rules/recommend.ts > recommend 분기 | C2 enum 밖 status 값(예상 밖 입력)이 unknown·outOfHorizon 분기를 지나 known 경로로 흘러 집계→deferred로 처리된다. 예외를 던지지 않는 안전한 폴백이라 결함은 아니나, 암묵적 동작이라 의도가 드러나지 않는다. | 선택: cloud.status를 enum으로 명시 가드하거나, known이 아닌 알 수 없는 상태를 deferred(reason='cloud status unknown')로 명시 분기해 의도를 드러내라. | New |
| R-03 | Minor | src/domain-rules/code-summary.md > 테스트 커버리지 요약 / src/domain-rules/index.ts | index.ts 라인 커버리지 0%(재노출 배럴). 단위 전체 플로어(97.35%)는 충족하고 실행 로직이 없어 수용 가능하나 기록해 둔다. | 조치 불필요. 현재대로 code-summary에 사유가 기록돼 있으면 충분. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| vitest(coverage, unit-scoped) | PASS: 29/29, Lines 97.35% | 기능·경계·우선순위 커버. 80% 핵심 모듈 플로어 충족 |
| tsc --noEmit | PASS | 상류 계약 타입 정합, C3 시그니처 일치 |
| eslint src/domain-rules | PASS | 스타일·린트 위반 없음 |

### Summary

C3 계약 정합·분기 우선순위(SD1/BR2.4)·임계값 경계·입력 검증·순수성·테스트 유의미성은 적대적 반증 시도 후에도 모두 견고했고, 검증 명령 3종이 실측으로 뒷받침한다. 블로킹 Critical은 없고 Major 1건(추석 2026 대체공휴일 누락 — 테이블 내부 규칙 불일치, 핵심 연휴 비교에 영향)이다. Major가 1건이므로 verdict는 READY이나, 머지 전 공휴일 테이블의 토·일 겹침 대체 규칙 일관성(특히 추석·설날)을 바로잡을 것을 강하게 권고한다.
