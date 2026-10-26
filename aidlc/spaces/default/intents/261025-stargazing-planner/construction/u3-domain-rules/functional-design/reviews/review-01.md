## Review

**Verdict:** NOT-READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 브리프에 `Date for this review:` 줄이 제공되지 않음 (리뷰어는 날짜를 추정하지 않음)
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > coverage 항목 AC2.1.2 | AC2.1.2는 "달 조도 ≤ 20%이지만 구름량 > 30%인 **가까운(구름 예보 있는)** 날 → 추천 아님" 기준이다(stories.md US2.1). 이는 known 구름 상태의 not_recommended 경로이므로 BR2.1/BR2.2가 담당한다. 그런데 트레이서빌리티는 AC2.1.2를 BR2.3(outOfHorizon, 구름 예보 없는 먼 날짜 규칙)에 매핑했다. 수용기준이 실제로 검증하는 규칙과 매핑 대상이 서로 다르다. | AC2.1.2의 target을 known-경로 규칙(BR2.1 또는 BR2.2)으로 바로잡는다. | New |
| R-02 | Major | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > upstream_ids / coverage | AC2.1.3("구름 예보가 없는 먼 날짜의 달 조도 ≤ 20% → 달 조도만으로 추천", stories.md US2.1)는 BR2.3(outOfHorizon)이 구현하는 **바로 그** 수용기준인데 upstream_ids와 coverage 어디에도 없다. 결과적으로 (a) BR2.3의 실제 상류 근거가 커버되지 않은 GAP이고, (b) 위 AC2.1.2 오매핑과 합쳐져 "BR2.3이 커버된 것처럼" 보이지만 실제 근거(AC2.1.3)는 빠져 있다. | AC2.1.3을 upstream_ids와 coverage에 추가하고 target=BR2.3으로 매핑한다. 이로써 BR2.3의 상류 커버리지가 성립한다. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > reverse 항목 BR1.4, BR1.5 | BR1.4와 BR1.5는 rules.md에서 source=FR1.1로 상류 추적이 있는 규칙이다(진짜 orphan이 아님). 이를 reverse(상류로 추적되지 않는 산출물)에 N/A로 둔 것은 정당화 문구가 있어 허용되지만, 분류상 FR1.1 커버리지의 하위 규칙으로 두는 편이 추적 체인을 더 정확히 표현한다. | 선택: BR1.4·BR1.5를 FR1.1(또는 그 하위 AC) 커버리지로 재분류하거나, 현재 reverse/N/A를 유지하되 "FR1.1 하위 규칙임"을 target 문구에 명확히 남긴다. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/rules.md > BR2.6 와 functional-spec.md > WF2 3단계 | 밤 구간 구름량 "집계값"(평균/대표값)과 임계값 CLOUD_MAX_PCT(≤ 30%) 비교의 경계(≤ vs <)는 BR2.1/BR2.2에서 `<= 30` / `> 30`으로 일관되지만, 집계 방식 자체(평균 vs 최댓값 등)가 code-generation으로 이월되어 있어 경계 판정의 의미가 집계 방식에 따라 달라질 수 있다. 설계상 공백은 아니나(명시적으로 이월됨) 경계 민감 규칙이므로 짚어 둔다. | 선택: code-generation에서 집계 방식을 확정할 때 경계(정확히 30%)가 recommended 쪽임을 집계값 기준으로 재확인하도록 BR2.6에 한 줄 메모를 남긴다. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| (브리프에 검증 도구 미지정) | 수동 교차검증 수행 | 상류 artifacts(requirements.md FR1·FR2, stories.md AC, contract-summary.md C1·C2·C3, unit-of-work.md U3)와 설계·트레이서빌리티를 ID 단위로 대조. 구조적 검증 CLI는 브리프에 지정되지 않아 실행하지 않음(설계 단계, functional-spec 리뷰). |
| u1/u2 실제 타입 대조 | PASS (U3 참조 필드 한정) | U3가 참조하는 `astro.moonIlluminationPct`(src/astronomy/types.ts: number, non-null)와 `cloud.status`/`cloud.hourlyCloudPct`(src/weather/types.ts: CloudStatus 3-상태, HourlyCloud[]\|null)가 설계와 일치. U3가 쓰는 교차 단위 필드는 건전함. |

### Summary

C3 계약 정합과 추천 3-상태 분기 자체는 건전하다. `CalendarDate.holidayCoverage`·`holidayGroupId`, `Recommendation.moonIlluminationPct`·`cloudConsidered`는 C3에 없는 필드지만 contract-summary의 "추가(additive) 변경은 안전" 규칙에 부합하는 **안전한 내부 확장**이며 계약 위반이 아니다(단, U4가 이 확장 필드에 의존하게 되므로 C3 문서에 명시 권장). 상태 분기(outOfHorizon→조도만, 범위 안 unknown→deferred, known→조도+구름, known이나 밤 구간 데이터 없음→deferred)는 완전하고 겹치지 않으며, BR2.3(outOfHorizon)과 BR2.4(unknown)의 구분도 명확하다. 임계값 경계(≤ 20 / ≤ 30)는 BR2.1·BR2.2·BR2.3·BR2.5 전반에서 일관되게 "경계=추천 쪽"으로 정합한다. BR1.5(outOfTable→주말만)는 WF1에 반영되었고 BR1.4(연휴 묶음)와 FR1.2(공휴일 없으면 주말)의 상호작용에도 모순이 없다. NOT-READY의 근거는 전적으로 traceability.json의 추천 분기 매핑 오류 두 건(Major): AC2.1.2가 known-경로 규칙이 아니라 BR2.3에 잘못 매핑되었고, BR2.3의 실제 상류 근거인 AC2.1.3이 커버리지에서 누락되었다. 이 두 건은 서로를 가려 "BR2.3이 커버된 것처럼" 보이게 하므로 반드시 바로잡아야 한다.
