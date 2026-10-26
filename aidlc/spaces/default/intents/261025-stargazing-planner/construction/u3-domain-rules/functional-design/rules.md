# Business Rules — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library). 근거: requirements.md(FR1.1~FR1.4·FR2.2~FR2.4), contract-summary.md(C1·C2·C3), stories(US1.1~US1.3·US2.x), functional-design-questions.md(Q1~Q5). 기술 비의존.

## 소스 오브 트루스 (business rules)

```yaml
rules:
  - id: BR1.1
    statement: "listCandidateDates는 fromKstId부터 months(≥3)개월 범위의 모든 주말과 한국 공휴일 연휴 날짜를 날짜순으로 산출한다."
    category: calculation
    applies_to: CalendarDate
    trigger: "listCandidateDates(range)"
    logic: "IF 날짜가 주말(토·일) OR 공휴일(내장 테이블) THEN 후보 밤으로 포함. 날짜순 정렬."
    violation_behaviour: "없음(정상 산출)."
    source: FR1.1

  - id: BR1.2
    statement: "범위 내 공휴일 연휴가 없으면 주말만이라도 후보에 포함한다."
    category: policy
    applies_to: CalendarDate
    trigger: "listCandidateDates(range)"
    logic: "IF 공휴일 연휴 없음 THEN 주말 밤만으로 목록을 구성(빈 목록이 되지 않도록)."
    violation_behaviour: "없음."
    source: FR1.2

  - id: BR1.3
    statement: "'그날 밤'은 KST 기준 해당 날짜 저녁부터 다음날 새벽까지로 묶어 nightStartKst~nightEndKst로 둔다."
    category: calculation
    applies_to: CalendarDate
    trigger: "후보 밤 생성"
    logic: "IF 후보 날짜 D THEN nightStartKst=D 저녁(KST), nightEndKst=D+1 새벽(KST). 추천·표시 모두 이 밤 범위를 기준으로 한다."
    violation_behaviour: "없음."
    source: FR1.4

  - id: BR1.4
    statement: "연속된 주말+공휴일은 하나의 '연휴' 묶음(holidayGroupId)으로 묶고, 묶음의 각 밤을 모두 후보로 둔다. 라벨은 묶음 이름."
    category: policy
    applies_to: CalendarDate
    trigger: "listCandidateDates(range)"
    logic: "IF 연속된 날짜들이 주말 또는 공휴일로 끊김 없이 이어지면 THEN 같은 holidayGroupId를 부여하고 label을 묶음 이름(공휴일명 우선, 없으면 '주말')으로 둔다. 각 밤은 독립 CalendarDate로 유지(U4가 밤별로 표시 가능)."
    violation_behaviour: "없음."
    source: FR1.1

  - id: BR1.5
    statement: "공휴일 판정은 코드 내장 테이블(HolidayTable)로 하며, 테이블은 커버 연도 범위(fromYear~toYear)를 가진다. 범위 밖 날짜는 holidayCoverage=outOfTable로 두고 공휴일 정보 없이 주말만으로 후보를 판정한다."
    category: constraint
    applies_to: "CalendarDate.holidayCoverage / HolidayTable"
    trigger: "후보 날짜의 공휴일 여부 판정"
    logic: >
      IF 날짜의 연도 ∈ [HolidayTable.fromYear, HolidayTable.toYear] THEN holidayCoverage=covered,
      내장 테이블로 isHoliday 판정(대체공휴일 포함).
      ELSE holidayCoverage=outOfTable, isHoliday=false로 두고 isWeekend만으로 후보 포함 여부를 정한다
      (범위 밖 연도의 공휴일을 임의로 추정하지 않는다). 네트워크 호출 없음.
    violation_behaviour: "없음(범위 밖은 주말만 안전하게 처리). 테이블 커버 범위는 매년 갱신 대상."
    source: FR1.1

  - id: BR2.1
    statement: "추천 판정은 밤 단위로 recommend(astro, cloud)가 산출하며, 달 조도가 낮고(어두운 밤) 구름이 적을 때만 recommended."
    category: calculation
    applies_to: Recommendation.verdict
    trigger: "recommend(astro, cloud)"
    logic: "IF moonIlluminationPct <= 20 AND cloud.status=known AND 그날 밤 구름량 <= 30 THEN recommended. (구름 판정은 BR2.4의 밤 구간 집계값 사용.)"
    violation_behaviour: "조건 미충족은 BR2.2(not_recommended)."
    source: FR2.2

  - id: BR2.2
    statement: "조도 또는 구름 조건을 충족하지 못하면 not_recommended."
    category: calculation
    applies_to: Recommendation.verdict
    trigger: "recommend(astro, cloud)"
    logic: "IF (moonIlluminationPct > 20) OR (cloud.status=known AND 밤 구름량 > 30) THEN not_recommended."
    violation_behaviour: "없음."
    source: FR2.2

  - id: BR2.3
    statement: "구름 예보가 outOfHorizon(먼 날짜, 예보 범위 밖)이면 구름 조건을 적용하지 않고 달 조도만으로 추천을 판정한다."
    category: policy
    applies_to: Recommendation.verdict
    trigger: "recommend(astro, cloud), cloud.status=outOfHorizon"
    logic: "IF cloud.status=outOfHorizon THEN cloudConsidered=false; moonIlluminationPct <= 20이면 recommended, 아니면 not_recommended(구름은 날짜가 가까워지면 채워짐). deferred가 아니다."
    violation_behaviour: "없음(정상적 '먼 날짜' 처리)."
    source: FR2.3

  - id: BR2.4
    statement: "구름 예보가 예보 범위 안인데 unknown(호출 실패/결측)이면 verdict=deferred로 판단을 보류한다. 목록에서 제외하지 않고 추천/비추천 뒤로 정렬한다."
    category: validation
    applies_to: Recommendation.verdict
    trigger: "recommend(astro, cloud), cloud.status=unknown"
    logic: "IF cloud.status=unknown THEN verdict=deferred, reason='cloud unknown', cloudConsidered=false. 달 조도는 표시용으로 전달하되 추천 점수는 산출하지 않는다. 정렬 시 recommended·not_recommended 뒤에 둔다(제외하지 않음, Q4). outOfHorizon(BR2.3)과 혼동하지 않는다: 범위 밖이 아니라 '일시적으로 모름'이다."
    violation_behaviour: "없음(판단 보류 상태). 사용자 재진입으로 구름이 채워지면 재판정."
    source: FR2.3

  - id: BR2.5
    statement: "추천 임계값은 달 조도 ≤ 20%, 구름량 ≤ 30%로 확정하며 단일 상수 지점에 모은다."
    category: constraint
    applies_to: "recommend 임계값"
    trigger: "code-generation 상수 정의"
    logic: "IF 임계값을 쓰면 THEN MOON_ILLUMINATION_MAX_PCT=20, CLOUD_MAX_PCT=30 상수를 한 곳에 두고 계산 로직과 분리한다(ADR-002). 밤 구간 구름량 집계 방식(평균/대표값)은 code-generation에서 확정."
    violation_behaviour: "임계값을 여러 곳에 흩뿌리지 않는다."
    source: FR2.4

  - id: BR2.6
    statement: "'그날 밤' 구름량은 nightStartKst~nightEndKst 구간의 시간별 구름량(hourlyCloudPct)에서 집계해 판정에 쓴다."
    category: calculation
    applies_to: Recommendation
    trigger: "recommend(astro, cloud), cloud.status=known"
    logic: "IF cloud.status=known THEN 밤 범위에 속하는 HourlyCloud 값들을 집계(대표값, code-generation에서 평균 등으로 확정)해 CLOUD_MAX_PCT와 비교한다. 집계 방식(평균/최댓값 등)을 확정할 때 경계(정확히 30%)가 recommended 쪽임을 집계값 기준으로 재확인한다(BR2.5의 <= 30 경계 의미 보존). 밤 범위에 해당 시각 데이터가 하나도 없으면 unknown처럼 deferred로 둔다(BR2.4)."
    violation_behaviour: "없음."
    source: FR2.2
```

## 규칙 요약

| ID | 범주 | 요지 | 출처 |
|----|------|------|------|
| BR1.1 | calculation | 3개월+ 범위의 주말·공휴일 연휴 날짜순 산출 | FR1.1 |
| BR1.2 | policy | 공휴일 연휴 없으면 주말만이라도 포함 | FR1.2 |
| BR1.3 | calculation | '그날 밤' = KST 저녁~다음날 새벽 | FR1.4 |
| BR1.4 | policy | 연속 주말+공휴일을 '연휴' 묶음(holidayGroupId)으로, 라벨=묶음 이름 | FR1.1 |
| BR1.5 | constraint | 공휴일=내장 테이블(커버 연도 범위). 범위 밖=outOfTable, 주말만 판정 | FR1.1 |
| BR2.1 | calculation | 조도 ≤ 20% AND (known이면 구름 ≤ 30%) → recommended | FR2.2 |
| BR2.2 | calculation | 조건 미충족 → not_recommended | FR2.2 |
| BR2.3 | policy | outOfHorizon → 달 조도만으로 추천(구름 미적용) | FR2.3 |
| BR2.4 | validation | 범위 안 unknown → deferred(보류, 뒤로 정렬, 제외 안 함) | FR2.3 |
| BR2.5 | constraint | 임계값 조도 ≤ 20%·구름 ≤ 30% 단일 상수 | FR2.4 |
| BR2.6 | calculation | 밤 구간 시간별 구름량 집계로 판정, 데이터 없으면 deferred | FR2.2 |

## Assumptions & Open Questions

- 내장 공휴일 테이블의 구체 커버 연도 범위와 대체공휴일 규칙, 밤 구간 구름량 집계 방식(평균/최댓값 등)은 code-generation에서 확정한다. [assumption]
