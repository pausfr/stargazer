# Entities — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library). 근거: contract-summary.md(C1·C2·C3), unit-of-work.md(U3), requirements.md(FR1·FR2), functional-design-questions.md(Q1~Q5). 기술 비의존 설계; 구현 코드는 code-generation에서.

## 소스 오브 트루스 (entity model)

```yaml
entities:
  - name: DateRange
    description: listCandidateDates 입력. 시작일과 개월 수(C3).
    attributes:
      - name: fromKstId
        type: string
        required: true
        constraints: "KST 날짜 키 YYYY-MM-DD(조회 시작)"
      - name: months
        type: number
        required: true
        min: 3
        constraints: "3개월 이상(FR1.1)"

  - name: CalendarDate
    description: 후보 날짜 한 밤. 주말 또는 공휴일 연휴에 속하는 "그날 밤"(FR1.4). dateKstId로 식별.
    identifier: dateKstId
    attributes:
      - name: dateKstId
        type: string
        required: true
        unique: true
        constraints: "KST 날짜 키 YYYY-MM-DD"
      - name: label
        type: string
        required: true
        constraints: "연휴/주말 이름(연휴 묶음 이름 또는 '주말')"
      - name: isHoliday
        type: boolean
        required: true
      - name: isWeekend
        type: boolean
        required: true
      - name: holidayCoverage
        type: HolidayCoverage
        required: true
        constraints: "이 날짜가 내장 공휴일 테이블 커버 연도 범위 안인지(covered | outOfTable). outOfTable이면 공휴일 판정 없이 주말만으로 후보 결정(Q1)."
      - name: nightStartKst
        type: string
        required: true
        constraints: "그날 밤 시작(KST 저녁, ISO 시각). FR1.4·AC1.1.2."
      - name: nightEndKst
        type: string
        required: true
        constraints: "다음날 새벽(KST, ISO 시각)."
      - name: holidayGroupId
        type: string
        required: false
        constraints: "연속 주말+공휴일 묶음 식별자. 같은 연휴 묶음의 밤들은 동일 값(Q3). 단독 주말은 자체 그룹."

  - name: HolidayCoverage
    description: 날짜가 내장 공휴일 테이블의 커버 연도 범위 안/밖인지(Q1).
    attributes:
      - name: value
        type: enum
        allowed_values: [covered, outOfTable]

  - name: Recommendation
    description: 한 밤의 추천 판정 결과(C3). AstronomyResult·CloudForecast를 입력으로 recommend가 산출.
    identifier: dateKstId
    attributes:
      - name: dateKstId
        type: string
        required: true
        unique: true
      - name: verdict
        type: RecommendationVerdict
        required: true
      - name: reason
        type: string
        required: false
        constraints: "verdict=deferred일 때 보류 사유(예: cloud unknown). 그 외 null."
      - name: moonIlluminationPct
        type: number
        required: true
        min: 0
        max: 100
        constraints: "판정에 쓰인 달 조도(표시용으로 함께 전달)."
      - name: cloudConsidered
        type: boolean
        required: true
        constraints: "구름 조건을 판정에 반영했는지(known=true, outOfHorizon/unknown=false)."

  - name: RecommendationVerdict
    description: 추천 판정 3분류(C3).
    attributes:
      - name: value
        type: enum
        allowed_values: [recommended, not_recommended, deferred]

  - name: HolidayTable
    description: 내장 한국 공휴일 테이블(Q1). 코드 상수로 보관, 네트워크 없음.
    attributes:
      - name: fromYear
        type: number
        required: true
        constraints: "커버 시작 연도(포함)."
      - name: toYear
        type: number
        required: true
        constraints: "커버 종료 연도(포함). 범위 밖 날짜는 outOfTable."
      - name: entries
        type: HolidayEntry[]
        required: true

  - name: HolidayEntry
    description: 공휴일 한 건(법정공휴일 + 대체공휴일 반영).
    attributes:
      - name: dateKstId
        type: string
        required: true
        constraints: "YYYY-MM-DD"
      - name: name
        type: string
        required: true
        constraints: "공휴일 이름(예: 추석, 대체공휴일)."

relationships:
  - "DateRange → CalendarDate[]: listCandidateDates가 범위 내 주말·공휴일 연휴 밤들을 산출(1:N)."
  - "CalendarDate들은 holidayGroupId로 '연휴 묶음'을 이룬다(N:1, 묶음은 논리 그룹). 라벨은 묶음 이름(Q3)."
  - "CalendarDate + AstronomyResult(C1) + CloudForecast(C2) → Recommendation: recommend가 밤 단위로 산출(1:1)."
  - "HolidayTable은 HolidayEntry[]를 보유(1:N). CalendarDate.holidayCoverage는 날짜 연도와 테이블 범위 비교로 결정."
```

## 사람이 읽는 요약

U3는 "언제 볼까"(달력)와 "그날 밤이 좋은가"(추천)를 담는 순수 도메인 규칙 라이브러리다. `DateRange`(시작일·3개월 이상)로 범위 내 주말·공휴일 연휴 밤들(`CalendarDate`)을 산출한다. 공휴일은 코드 내장 `HolidayTable`(커버 연도 범위를 가짐)로 판정하며, 범위 밖 연도는 `holidayCoverage=outOfTable`로 공휴일 없이 주말만 후보에 넣는다. 연속된 주말+공휴일은 `holidayGroupId`로 하나의 "연휴" 묶음을 이루고 라벨은 묶음 이름이 된다. 각 밤에 대해 `recommend`가 `AstronomyResult`(달 조도)와 `CloudForecast`(구름 상태)를 받아 `Recommendation`을 낸다: 조도 ≤ 20%이고 구름이 known이면 구름 ≤ 30%까지 충족해야 recommended, outOfHorizon이면 조도만으로 판정, 예보 범위 안 unknown이면 deferred(보류, 뒤로 정렬). 영속 상태 없음.

## Assumptions & Open Questions

- 내장 공휴일 테이블의 구체 커버 연도 범위(예: 현재+3년)는 code-generation에서 상수로 확정한다. 대체공휴일 규칙 반영 포함. [assumption]
