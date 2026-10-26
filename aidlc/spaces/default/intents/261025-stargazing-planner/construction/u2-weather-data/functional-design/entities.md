# Entities — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: contract-summary.md(C2 CloudForecast 3-상태, C4 날씨 API 소비), components.md(WeatherClient·DataCache), functional-design-questions.md(Q1~Q5). 기술 비의존 설계; 구현 코드는 code-generation에서.

## 소스 오브 트루스 (entity model)

```yaml
entities:
  - name: CloudForecastQuery
    description: 구름량 예보 조회 입력. 날짜 키와 좌표.
    attributes:
      - name: dateKstId
        type: string
        required: true
        constraints: "KST 날짜 키 YYYY-MM-DD"
      - name: lat
        type: number
        required: true
        constraints: "전국 대표 좌표 위도"
      - name: lon
        type: number
        required: true
        constraints: "전국 대표 좌표 경도"

  - name: CloudForecast
    description: 한 날짜의 구름량 예보 결과. dateKstId로 식별(C2). 어댑터가 외부 응답/실패를 3-상태로 정규화한 뒤 반환.
    identifier: dateKstId
    attributes:
      - name: dateKstId
        type: string
        required: true
        unique: true
      - name: status
        type: CloudStatus
        required: true
        constraints: "known | outOfHorizon | unknown"
      - name: hourlyCloudPct
        type: HourlyCloud[]
        required: false
        constraints: "status=known일 때만 채워짐. 그 외 null."
      - name: reason
        type: string
        required: false
        constraints: "status=unknown일 때 내부 사유(로그 전용, UI 비노출). 그 외 null."
    constraints:
      - "status=known이면 hourlyCloudPct 채워짐, reason=null."
      - "status=outOfHorizon이면 hourlyCloudPct=null, reason=null(정상적 '먼 날짜')."
      - "status=unknown이면 hourlyCloudPct=null, reason에 내부 사유."

  - name: HourlyCloud
    description: 시간별 구름량 한 점.
    attributes:
      - name: hourKst
        type: string
        required: true
        constraints: "ISO 시각(KST)"
      - name: cloudPct
        type: number
        required: true
        min: 0
        max: 100
        constraints: "구름량 %"

  - name: CloudStatus
    description: 구름 예보 상태 3분류(C2).
    attributes:
      - name: value
        type: enum
        allowed_values: [known, outOfHorizon, unknown]

  - name: CacheEntry
    description: DataCache의 한 항목. 조회 결과를 TTL과 함께 보관.
    identifier: cacheKey
    attributes:
      - name: cacheKey
        type: string
        required: true
        unique: true
        constraints: "dateKstId + lat + lon 조합"
      - name: forecast
        type: CloudForecast
        required: true
      - name: storedAtMs
        type: number
        required: true
        constraints: "저장 시각(epoch ms)"
      - name: ttlMs
        type: number
        required: true
        constraints: "status=known은 길게(수십 분~1시간), unknown은 짧게. outOfHorizon도 길게(날짜 기반 결정적)."

relationships:
  - "CloudForecast는 status=known일 때 여러 HourlyCloud를 포함(1:N, 합성). 그 외 없음."
  - "CacheEntry는 1개의 CloudForecast를 감싼다(1:1)."
  - "CloudForecastQuery → CloudForecast: WeatherClient 어댑터가 산출(1:1, 외부 호출 또는 사전 컷오프)."
```

## 사람이 읽는 요약

U2는 외부 무료 날씨 API를 감싸 구름량 예보를 가져오는 데이터 접근 라이브러리다. 입력 `CloudForecastQuery`(날짜·좌표)로 `CloudForecast`를 반환하며, 결과는 C2 계약의 3-상태(`known`/`outOfHorizon`/`unknown`)로 정규화된다. `DataCache`는 `CacheEntry`로 조회 결과를 TTL과 함께 보관해 무료 한도를 보호한다(known 길게, unknown 짧게). 영속 저장이 아니라 세션 범위 메모리 캐시다.

## Assumptions & Open Questions

- 구체 무료 날씨 API(Open-Meteo 1순위)와 그 구름량 필드·예보 범위는 code-generation에서 확정(A2). [assumption]
