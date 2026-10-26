## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-26T14:09:31Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | construction/u2-weather-data/functional-design/rules.md > BR1.1/BR2.1, functional-spec.md > WF1 2~4단계 | 고정 14일 컷오프와 실제 날씨 API 예보 범위가 어긋나면 `outOfHorizon`과 `unknown`이 서로 섞인다. API 실제 범위가 14일보다 짧으면(예: 7일) 8~14일 날짜는 호출 후 구름량 결측으로 BR2.1에 의해 `unknown`("구름량 알 수 없음")이 되지만 C2 의미상 이는 `outOfHorizon`("날씨는 날짜가 가까워지면 표시")이어야 한다. 반대로 실제 범위가 14일보다 길면 14일 초과 날짜가 데이터가 있는데도 BR1.1로 호출 없이 `outOfHorizon`이 되어 사용 가능한 구름 데이터를 가린다. 설계는 이 어긋남을 functional-spec.md의 [assumption](FORECAST_HORIZON_DAYS를 code-generation에서 실제 범위에 맞춤)으로만 넘긴다. | 상수 하나 조정으로 해소된다는 가정을 명시한 것은 타당하나, "결측(14일 이내)"과 "지평 밖"을 서로 다른 상태로 되돌리는 분기 기준을 설계 수준에서 못박아 둘 것. 예: 14일 이내 호출에서 구름량 결측이 발생했을 때 그것을 `unknown`으로 볼지 `outOfHorizon`으로 볼지의 판정 규칙(또는 FORECAST_HORIZON_DAYS를 실제 API 범위와 반드시 일치시키라는 불변식)을 BR1.1/BR2.1에 추가해 두 상태가 겹치지 않게 한다. | New |
| R-02 | Minor | construction/u2-weather-data/functional-design/functional-design-questions.md Q4 vs contract-summary.md C2/C4, requirements.md FR2.2 | Q4=B(14일 고정 컷오프)는 상위 계약 C4·C2 설계 전제와 FR2.2 주석("경계값 경계가 아니라 '해당 날짜에 구름 예보가 존재하는가'로 판정")을 의도적으로 번복한 결정이다. 사람이 기록한 결정이라 그 자체는 문제가 아니나, 상위 계약 본문에는 이 번복이 반영되어 있지 않아 C4의 "요청조차 하지 않거나 빈 결과 처리" 서술과 BR1.1의 "사전 컷오프"가 표현상 미묘하게 어긋난다. | C2/C4 또는 본 단위 문서에 "예보 지평 판별 = 오늘+FORECAST_HORIZON_DAYS 고정 컷오프(Q4=B)"임을 한 줄로 명시해 상위 계약의 data-driven 서술과의 불일치를 제거한다(설계 명세 범위 내). | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| 추적성 수동 교차검증 (traceability.json vs stories.md) | PASS | upstream_ids가 U2 매핑 스토리(US1.3·US3.1·US4.1)의 AC 9개(AC1.3.1~3, AC3.1.1~3, AC4.1.1~3)를 모두 열거. OK 타깃 BR1.2/BR1.1/BR2.1/BR3.1 전부 rules.md에 실재. N/A 사유(u1-astronomy/u4-web-ui 위임) 타당. reverse가 BR2.2/BR3.2/BR4.1 고아 규칙을 설명, 7개 규칙 전부 설명됨. GAP 없음. |
| 엔티티 vs C2 수동 대조 (entities.md vs contract-summary.md) | PASS | CloudForecast status(known/outOfHorizon/unknown), hourlyCloudPct(known일 때만·그 외 null), reason(unknown일 때만·로그 전용), HourlyCloud{hourKst,cloudPct 0~100} 모두 C2 스키마와 일치. CacheEntry는 설계 고유(계약에 없음, 정당). |
| mermaid 구문 점검 (functional-spec.md) | PASS | stateDiagram-v2(캐시 히트/지평 체크/Fetch→known·unknown/outOfHorizon 분기)와 erDiagram(CloudForecastQuery·CloudForecast·HourlyCloud·CacheEntry) 구문 유효, 텍스트 폴백 각각 존재. |
| 무비밀/타임아웃 정합 (BR4.1 vs NFR6·C4·project.md) | PASS | 타임아웃+키 불필요 공개 API 우선+번들 내 비밀값 금지가 NFR6·C4·project.md Forbidden과 일치. silent failure 금지(BR2.1 reason 기록)로 조용한 실패 없음. |

### Summary

C2 3-상태·캐시 TTL·어댑터 경계·무비밀/타임아웃·추적성·mermaid는 모두 건전하고 구현 가능하다. 유일한 실질 쟁점은 사람이 기록한 Q4=B(14일 고정 컷오프)가 만든 `outOfHorizon` vs `unknown` 경계 모호성으로, 단일 상수 조정 가정으로만 넘겨져 있다 — 개발을 막지는 않으나 상태 분기 기준을 설계 수준에서 못박아 두면 하류 재작업을 줄인다. Critical 0, Major 1이므로 READY.
