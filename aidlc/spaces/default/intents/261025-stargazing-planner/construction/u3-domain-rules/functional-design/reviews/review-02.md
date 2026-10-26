## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-26
**Iteration:** 2
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > coverage 항목 AC2.1.2 | AC2.1.2는 "달 조도 ≤ 20%이지만 구름량 > 30%인 **가까운(구름 예보 있는)** 날 → 추천 아님" 기준이다(stories.md US2.1). 이는 known 구름 상태의 not_recommended 경로이므로 BR2.1/BR2.2가 담당한다. 그런데 트레이서빌리티는 AC2.1.2를 BR2.3(outOfHorizon, 구름 예보 없는 먼 날짜 규칙)에 매핑했다. 수용기준이 실제로 검증하는 규칙과 매핑 대상이 서로 다르다. | AC2.1.2의 target을 known-경로 규칙(BR2.1 또는 BR2.2)으로 바로잡는다. | Resolved (reviewer) |
| R-02 | Major | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > upstream_ids / coverage | AC2.1.3("구름 예보가 없는 먼 날짜의 달 조도 ≤ 20% → 달 조도만으로 추천", stories.md US2.1)는 BR2.3(outOfHorizon)이 구현하는 **바로 그** 수용기준인데 upstream_ids와 coverage 어디에도 없다. 결과적으로 (a) BR2.3의 실제 상류 근거가 커버되지 않은 GAP이고, (b) 위 AC2.1.2 오매핑과 합쳐져 "BR2.3이 커버된 것처럼" 보이지만 실제 근거(AC2.1.3)는 빠져 있다. | AC2.1.3을 upstream_ids와 coverage에 추가하고 target=BR2.3으로 매핑한다. 이로써 BR2.3의 상류 커버리지가 성립한다. | Resolved (reviewer) |
| R-03 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/traceability.json > reverse 항목 BR1.4, BR1.5 | BR1.4와 BR1.5는 rules.md에서 source=FR1.1로 상류 추적이 있는 규칙이다(진짜 orphan이 아님). 이를 reverse(상류로 추적되지 않는 산출물)에 N/A로 둔 것은 정당화 문구가 있어 허용되지만, 분류상 FR1.1 커버리지의 하위 규칙으로 두는 편이 추적 체인을 더 정확히 표현한다. | 선택: BR1.4·BR1.5를 FR1.1(또는 그 하위 AC) 커버리지로 재분류하거나, 현재 reverse/N/A를 유지하되 "FR1.1 하위 규칙임"을 target 문구에 명확히 남긴다. | Resolved (reviewer) |
| R-04 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u3-domain-rules/functional-design/rules.md > BR2.6 와 functional-spec.md > WF2 3단계 | 밤 구간 구름량 "집계값"(평균/대표값)과 임계값 CLOUD_MAX_PCT(≤ 30%) 비교의 경계(≤ vs <)는 BR2.1/BR2.2에서 `<= 30` / `> 30`으로 일관되지만, 집계 방식 자체(평균 vs 최댓값 등)가 code-generation으로 이월되어 있어 경계 판정의 의미가 집계 방식에 따라 달라질 수 있다. 설계상 공백은 아니나(명시적으로 이월됨) 경계 민감 규칙이므로 짚어 둔다. | 선택: code-generation에서 집계 방식을 확정할 때 경계(정확히 30%)가 recommended 쪽임을 집계값 기준으로 재확인하도록 BR2.6에 한 줄 메모를 남긴다. | Resolved (reviewer) |

> R-01 Reviewer note: traceability.json의 AC2.1.2가 BR2.3(outOfHorizon) 오매핑에서 BR2.2(known 비추천)로 바로잡혔다. stories.md AC2.1.2(조도 ≤ 20%이나 구름 > 30% → 추천 아님)와 의미가 정확히 일치한다.

> R-02 Reviewer note: AC2.1.3이 upstream_ids·coverage에 추가되었고 target=BR2.3(outOfHorizon, 조도만으로 추천)로 매핑됐다. stories.md AC2.1.3(구름 예보 없는 먼 날짜, 조도만)·FR2.3과 일치한다.

> R-03 Reviewer note: reverse의 BR1.4·BR1.5가 ORPHAN에서 status=OK, target="FR1.1 하위 규칙…"으로 재분류되어 진짜 상류(FR1.1)를 가리킨다. rules.md의 BR1.4·BR1.5 source=FR1.1과 정합한다.

> R-04 Reviewer note: BR2.6에 밤 구간 구름 집계 경계 메모가 추가되었다("경계(정확히 30%)가 recommended 쪽임을 집계값 기준으로 재확인… BR2.5의 <= 30 경계 의미 보존"). traceability reverse의 BR2.6 target에도 "경계는 집계값 기준으로 확정"으로 반영됐다.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| 상류 ID 대조(stories.md AC2.1.1~2.1.4) | PASS | AC2.1.1→BR2.1, AC2.1.2→BR2.2, AC2.1.3→BR2.3 매핑이 각 AC의 Given/When/Then 의미와 일치. AC2.1.4(색 비의존 강조)는 U4 소관으로 functional-spec에 명시되어 U3 누락 아님. |
| 계약 정합(contract-summary.md C3) | PASS | recommend 시그니처, RecommendationVerdict 3분류(recommended/not_recommended/deferred), CloudStatus 3-상태(known/outOfHorizon/unknown)가 rules.md·functional-spec·entities.md 전반에서 동일하게 쓰인다. |
| 3-상태 분기 완전성(functional-spec 상태도 + WF2) | PASS | 상태도가 구름 상태로 먼저 분기(OutOfHorizon/Unknown/KnownEval)하고 KnownEval에서 데이터 없음→deferred, 조도·구름 충족→recommended, 그 외→not_recommended로 모든 종단 상태에 도달. 죽은 분기 없음. |
| reverse 정합(traceability.json) | PASS | BR2.4(deferred)·BR2.5(임계값 상수)·BR2.6(집계 기술 규칙)는 AC 상류가 없는 reverse 항목으로 적절히 분류(N/A 사유 명시). |

### Summary

iter1의 Major 2건(AC2.1.2 오매핑, AC2.1.3 누락)과 Minor 2건(reverse 재분류, BR2.6 경계 메모)이 모두 바르게 수정되었고, 매핑은 stories.md의 실제 AC 의미와 일치한다. 수정이 새로운 모순·누락을 만들지 않았으며 3-상태 분기·밤 구간 경계·C3 계약 정합이 건전하다. 개발자가 추가 설계 문의 없이 구현 가능한 수준으로 판단해 READY.
