# Business Rules — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: requirements.md(FR5.1~FR5.3·FR6.1·FR6.3·NFR5·NFR6), contract-summary.md(C2·C4), stories(US1.3·US3.1·US4.1), functional-design-questions.md(Q1~Q5). 기술 비의존.

## 소스 오브 트루스 (business rules)

```yaml
rules:
  - id: BR1.1
    statement: "예보 지평 사전 컷오프: 요청 날짜가 오늘(KST) + FORECAST_HORIZON_DAYS(=14)를 넘으면 외부 API를 호출하지 않고 status=outOfHorizon을 반환한다."
    category: policy
    applies_to: CloudForecast.status
    trigger: "getCloudForecast(query)"
    logic: "IF dateKstId > (오늘 KST + 14일) THEN API 호출 없이 outOfHorizon 반환(hourlyCloudPct=null). FORECAST_HORIZON_DAYS는 상수 1개로 분리."
    violation_behaviour: "없음(정상적 '먼 날짜'). 불필요한 호출 절감(NFR5)."
    source: FR5.2

  - id: BR1.3
    statement: "불변식: FORECAST_HORIZON_DAYS는 실제 날씨 API가 보장하는 예보 범위와 같거나 그보다 작게 설정한다. 이 불변식이 outOfHorizon과 unknown을 겹치지 않게 만든다."
    category: constraint
    applies_to: "FORECAST_HORIZON_DAYS 상수"
    trigger: "code-generation에서 구체 API 선정 시"
    logic: >
      IF 실제 API 예보 범위가 R일이면 THEN FORECAST_HORIZON_DAYS <= R로 둔다.
      이러면 14일(=컷오프) 이내 날짜는 API가 반드시 데이터를 갖고 있어, 그 안에서의 결측/실패는
      '먼 날짜(outOfHorizon)'가 아니라 '일시적 데이터 없음/실패(unknown)'로만 발생한다(BR2.1).
      컷오프를 실제 범위보다 크게 두면(위반) 범위 밖인데도 unknown으로 오분류되므로 금지한다.
    violation_behaviour: "컷오프 > 실제 범위면 상태가 겹친다. code-generation에서 상수를 실제 범위에 맞춰 위반을 제거한다."
    source: FR5.2

  - id: BR1.2
    statement: "예보 범위 안(14일 이내) 요청은 외부 API를 호출해 구름량을 가져온다."
    category: calculation
    applies_to: CloudForecast
    trigger: "getCloudForecast(query), BR1.1 미해당"
    logic: "IF dateKstId <= (오늘 KST + 14일) THEN 외부 API를 호출해 시간별 구름량을 받는다. 성공·구름량 존재 시 status=known, hourlyCloudPct 채움."
    violation_behaviour: "실패/결측은 BR2.1(unknown)."
    source: FR5.1

  - id: BR2.1
    statement: "14일 이내 요청에서 호출 실패·타임아웃·파싱불가·구름량 결측은 status=unknown으로 정규화한다(outOfHorizon 아님). outOfHorizon은 BR1.1의 컷오프 초과로만 발생하며, BR1.3 불변식이 이 둘을 겹치지 않게 보장한다."
    category: validation
    applies_to: CloudForecast.status
    trigger: "BR1.2 호출 결과"
    logic: "IF (호출 실패 OR 타임아웃 OR 응답 파싱 불가 OR 해당 날짜 구름량 결측) THEN status=unknown, hourlyCloudPct=null, reason에 내부 사유 기록(로그 전용). 컷오프 이내의 결측을 outOfHorizon으로 바꾸지 않는다(그것은 '일시적으로 모름'이지 '먼 날짜'가 아니다). 조용히 실패하지 않는다."
    violation_behaviour: "오류를 삼키지 않는다(구성 가드레일: silent failure 금지). UI는 '구름량 알 수 없음' 중립 문구(FR6.1 갱신)."
    source: FR6.1

  - id: BR2.2
    statement: "WeatherClient 어댑터가 외부 응답/실패를 3-상태(known/outOfHorizon/unknown)로 정규화하며, 호출부는 정규화된 CloudForecast만 본다."
    category: policy
    applies_to: CloudForecast
    trigger: "getCloudForecast(query)"
    logic: "IF 결과를 반환하면 THEN 외부 API의 원형 응답·오류를 노출하지 않고 C2의 CloudForecast로만 반환한다(어댑터 경계)."
    violation_behaviour: "외부 응답 형식을 호출부로 누출 금지."
    source: C2

  - id: BR3.1
    statement: "조회 결과를 메모리 캐시에 TTL과 함께 보관해 무료 한도를 보호한다. known은 길게, unknown은 짧게, outOfHorizon도 길게."
    category: policy
    applies_to: CacheEntry
    trigger: "getCloudForecast 결과 반환 직후"
    logic: "IF 결과를 얻으면 THEN cacheKey(dateKstId+lat+lon)로 저장. status=known·outOfHorizon은 긴 TTL(수십 분~1시간), status=unknown은 짧은 TTL(빠른 재시도 허용). 유효 캐시가 있으면 호출 없이 반환."
    violation_behaviour: "없음. 과도한 재호출 방지(FR5.3, NFR5)."
    source: FR5.3

  - id: BR3.2
    statement: "재시도는 u2 내부에서 하지 않고 사용자 행동(화면 재진입)이 트리거한다. unknown의 짧은 TTL이 재진입 시 재호출을 성립시킨다."
    category: policy
    applies_to: "getCloudForecast / DataCache"
    trigger: "unknown 결과 이후 재조회"
    logic: "IF unknown이 반환되면 THEN u2는 자동 재시도하지 않고 결과 타입으로 실패를 전달한다. 재진입 시 짧은 TTL이 만료돼 재호출된다."
    violation_behaviour: "없음."
    source: FR6.1

  - id: BR4.1
    statement: "외부 API 호출에 합리적 타임아웃(수 초)을 둔다. 비밀값(키)을 쓰지 않는 공개 API를 우선한다."
    category: constraint
    applies_to: WeatherClient
    trigger: "외부 API 호출"
    logic: "IF 호출하면 THEN 타임아웃을 적용하고 초과 시 BR2.1(unknown). 키 불필요 공개 API 우선(NFR6); 키가 필요하면 code-generation/설계에서 프록시 여부 결정."
    violation_behaviour: "비밀값을 클라이언트 번들에 두지 않는다(NFR6, project.md Forbidden)."
    source: NFR6
```

## 규칙 요약

| ID | 범주 | 요지 | 출처 |
|----|------|------|------|
| BR1.1 | policy | 14일 초과 → 호출 없이 outOfHorizon | FR5.2 |
| BR1.3 | constraint | 불변식: FORECAST_HORIZON_DAYS ≤ 실제 API 예보 범위(두 상태 비중첩) | FR5.2 |
| BR1.2 | calculation | 14일 이내 → 호출해 known | FR5.1 |
| BR2.1 | validation | 14일 이내 실패/결측 → unknown(컷오프 이내는 outOfHorizon 아님) | FR6.1 |
| BR2.2 | policy | 어댑터가 3-상태로 정규화, 외부 응답 비노출 | C2 |
| BR3.1 | policy | TTL 캐시(known/outOfHorizon 길게, unknown 짧게) | FR5.3 |
| BR3.2 | policy | 자동 재시도 없음, 사용자 재진입이 트리거 | FR6.1 |
| BR4.1 | constraint | 타임아웃·키 불필요 공개 API 우선 | NFR6 |

## Assumptions & Open Questions

None.
