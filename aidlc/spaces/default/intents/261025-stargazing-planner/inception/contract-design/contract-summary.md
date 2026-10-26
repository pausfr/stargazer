# Contract Summary — 별 보기 좋은 날 추천 앱

> 근거: units-generation/unit-of-work.md, units-generation/unit-of-work-dependency.md, domain-design/components.md, requirements-analysis/requirements.md, contract-design-questions.md(Q1~Q6).
> 맥락: 백엔드 없는 단일 정적 번들(모놀리식 배포). 외부로 "공개(제공)"하는 API는 없음. 경계는 (1) 브라우저 내 단위 간 모듈 인터페이스, (2) U2가 외부로 "소비"하는 무료 날씨 API, (3) U1이 소비하는 천문 계산 라이브러리.

## Contracts 개요

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---------------|----------|-----------|-------|
| C1 | U1 u1-astronomy | U3, U4 (내부) | shared-schema (TS module export, 동기 함수+타입) | U1 |
| C2 | U2 u2-weather-data | U3, U4 (내부) | shared-schema (TS module export, 동기/Promise 함수+타입) | U2 |
| C3 | U3 u3-domain-rules | U4 (내부) | shared-schema (TS module export, 동기 함수+타입) | U3 |
| C4 | External: 무료 날씨 API | U2 u2-weather-data (소비) | OpenAPI (REST/HTTP) → 어댑터 정규화 | U2 |
| C5 | External: 천문 계산 라이브러리 | U1 u1-astronomy (소비) | library (in-process 호출) | U1 |

내부 경계(C1~C3)는 네트워크 경계가 아니라 번들 내 모듈 호출이다. 외부 경계(C4·C5)만 프로세스 밖과 통신한다.

## C1 — U1 astronomy 모듈 계약 (shared-schema)

U1은 결정론적 순수 계산이므로 동기 함수로 노출한다.

```yaml
# shared-schema: U1 u1-astronomy public module interface
kind: shared-schema
language: typescript
exports:
  computeAstronomy:
    signature: "(input: AstronomyInput) => AstronomyResult"
    sync: true
    throws: AstronomyComputationError   # 드문 계산 실패(FR6.2)
types:
  AstronomyInput:
    dateKstId: string      # KST 날짜 키 (예: "2026-10-26")
    lat: number            # 전국 대표 좌표 위도
    lon: number            # 전국 대표 좌표 경도
  AstronomyResult:
    dateKstId: string
    moonIlluminationPct: number        # 0~100 (FR4.2)
    civilTwilight: TwilightWindow
    nauticalTwilight: TwilightWindow
    astronomicalTwilight: TwilightWindow
    fullDarkStart: string | null       # 완전한 밤 시작 (ISO 시각)
    fullDarkEnd: string | null         # 완전한 밤 끝
    moonrise: string | null            # null = "없음"(그날 밤 월출 없음) (AC3.2.3)
    moonset: string | null             # null = "없음"(그날 밤 월몰 없음)
  TwilightWindow:
    start: string          # ISO 시각
    end: string
  AstronomyComputationError:
    code: "astronomy_failed"
    retryable: true
```

## C2 — U2 weather-data 모듈 계약 (shared-schema)

U2는 외부 API 호출을 감싸므로 비동기(Promise)로 노출하되, 실패를 예외로 던지지 않고 **결과 타입**으로 반환한다(Q6: 내부 경계는 결과 타입으로 성공/부분/실패 구분).

```yaml
# shared-schema: U2 u2-weather-data public module interface
kind: shared-schema
language: typescript
exports:
  getCloudForecast:
    signature: "(input: CloudForecastQuery) => Promise<CloudForecast>"
    sync: false
    throws: never          # 실패는 status 필드로 표현, 예외 없음
types:
  CloudForecastQuery:
    dateKstId: string
    lat: number
    lon: number
  CloudForecast:
    dateKstId: string
    status: CloudStatus                # known | outOfHorizon | unknown
    hourlyCloudPct: HourlyCloud[] | null   # status=known일 때만 채워짐
    reason: string | null              # status=unknown일 때 내부 사유(로그 전용, UI 비노출)
  CloudStatus:
    enum: [known, outOfHorizon, unknown]
    known: "예보 범위 안 + 정상 수신 → 구름량 표시"
    outOfHorizon: "예보 지평 밖(먼 날짜) → '날씨는 날짜가 가까워지면 표시' (FR5.2, AC1.3.3)"
    unknown: "호출 실패/타임아웃/파싱 불가 → ' 구름량 알 수 없음' 중립 문구 (FR6.1 갱신)"
  HourlyCloud:
    hourKst: string        # ISO 시각 (KST)
    cloudPct: number       # 0~100
```

## C3 — U3 domain-rules 모듈 계약 (shared-schema)

U3은 U1·U2의 결과를 입력받아 달력·추천을 산출한다.

```yaml
# shared-schema: U3 u3-domain-rules public module interface
kind: shared-schema
language: typescript
exports:
  listCandidateDates:
    signature: "(range: DateRange) => CalendarDate[]"   # 주말·공휴일 연휴 (FR1.1, FR1.2)
    sync: true
  recommend:
    signature: "(astro: AstronomyResult, cloud: CloudForecast) => Recommendation"
    sync: true
types:
  DateRange:
    fromKstId: string
    months: number         # >= 3 (FR1.1)
  CalendarDate:
    dateKstId: string
    label: string          # 연휴/주말 이름
    isHoliday: boolean
    isWeekend: boolean
    nightStartKst: string  # "그날 밤" 시작 (FR1.4, AC1.1.2)
    nightEndKst: string    # 다음날 새벽
  Recommendation:
    dateKstId: string
    verdict: RecommendationVerdict
    reason: string | null  # verdict=deferred일 때 missing 사유
  RecommendationVerdict:
    enum: [recommended, not_recommended, deferred]
    recommended: "달 조도 <= 20%(어두움). cloud.status=known이면 구름 <= 30% 추가 충족, cloud.status=outOfHorizon이면 달 조도만으로 판정(FR2.3)"
    not_recommended: "조도 또는 구름 조건 미충족"
    deferred: "예보 범위 안인데 cloud.status=unknown → 판단 보류(점수 산출 안 함, 정렬 시 뒤로 두되 제외하지 않음)"
```

추천 임계값(조도 ≤ 20%, 구름 ≤ 30%)은 잠정값이며 Functional Design/NFR에서 수치 확정(FR2.4, A1).

## C4 — 외부 무료 날씨 API 소비 계약 (OpenAPI, 추상)

구체 API(Open-Meteo류)는 Functional Design에서 확정하되, U2 어댑터가 지켜야 할 소비 계약의 형태를 지금 고정한다. 어댑터는 외부 응답을 C2의 `CloudForecast`로 정규화한다.

```yaml
# OpenAPI (abstract consumption contract) — U2 weather adapter boundary
openapi: 3.0.3
info:
  title: Free Weather API (cloud cover forecast) — consumed by U2
  version: "abstract-1"
paths:
  /forecast:
    get:
      summary: 좌표·기간의 시간별 구름량(운량) 예보 조회
      parameters:
        - name: latitude
          in: query
          required: true
          schema: { type: number }
        - name: longitude
          in: query
          required: true
          schema: { type: number }
        - name: hourly
          in: query
          required: true
          schema: { type: string, example: "cloudcover" }
      responses:
        "200":
          description: 예보(예보 지평 안)
          content:
            application/json:
              schema:
                type: object
                properties:
                  hourly:
                    type: object
                    properties:
                      time: { type: array, items: { type: string } }
                      cloudcover: { type: array, items: { type: number } }
        "4XX":
          description: 요청 오류 → 어댑터가 status=unknown으로 정규화
        "5XX":
          description: 공급자 오류 → 어댑터가 status=unknown으로 정규화
# 비기능/운영 메모:
# - 인증: 키 불필요 공개 API 우선(NFR6). 키 필요 시 Functional Design에서 프록시 여부 결정.
# - 무료 한도 보호: 앱 오픈 시 fetch + 짧은 캐시(FR5.3). unknown 응답은 짧은 TTL로 캐시(Q6).
# - 예보 지평 밖 날짜 → 어댑터가 status=outOfHorizon으로 정규화(요청조차 하지 않거나 빈 결과 처리).
# - 타임아웃/파싱 불가 → status=unknown, reason은 로그 전용.
```

## C5 — 천문 계산 라이브러리 소비 계약 (library)

```yaml
# library (in-process) — U1 astronomy boundary
kind: library
consumer: U1 u1-astronomy
provides:
  - 달 위상·조도 계산
  - 박명(시민·항해·천문) 시각 계산
  - 월출·월몰 계산
contract:
  determinism: "동일 입력(dateKstId, lat, lon) → 동일 출력. 네트워크 없음."
  failure: "드문 계산 실패는 U1이 AstronomyComputationError(retryable)로 호출부에 전달(FR6.2)."
# 구체 라이브러리 선정은 Functional Design에서 확정(A3).
```

## Contract Ownership (소유권·변경 규칙)

- **C1(U1), C2(U2), C3(U3)**: 각 제공 단위가 자기 module export 계약을 소유한다. 1인 프로젝트이므로 별도 리뷰 대신 변경 근거를 커밋 메시지로 남긴다(team-practices Way of Working).
- **C4(U2 어댑터)**: U2가 외부 날씨 API 소비 계약을 소유한다. 외부 공급자 응답 변동은 U2 어댑터가 흡수해 C2의 3-상태(known/outOfHorizon/unknown)로 격리한다.
- **C5(U1)**: U1이 천문 라이브러리 소비 경계를 소유한다.
- **추가(additive) 변경은 안전**: 소비자는 모르는 필드를 무시한다. **깨는(breaking) 변경**은 제공 단위와 모든 호출부를 같은 커밋에서 함께 수정한다(모놀리식 번들이라 원자적 변경 가능).
- **외부 날씨 API 버전**은 공급자가 관리하므로 U2 어댑터가 응답 변동을 흡수하고, 흡수 불가 시 status=unknown으로 격리한다.

## Open Questions

| Contract | Question | Blocks |
|----------|----------|--------|
| C4 | 사용할 구체 무료 날씨 API(Open-Meteo류)와 그 예보 지평·운량 필드·무료 한도·키 필요 여부 | U2 (Functional Design/NFR에서 확정, A2) |
| C5 | 사용할 구체 천문 계산 라이브러리와 전국 대표 좌표의 구체 위치 | U1 (Functional Design에서 확정, A3) |
| C3 | 추천 임계값(조도 ≤ 20%, 구름 ≤ 30%)의 최종 수치 | U3 (Functional Design/NFR에서 확정, FR2.4·A1) |
| C2/UI | FR6.1의 "불러오기 실패" 문구를 "구름량 알 수 없음" 중립 문구로 갱신 (Q6 결정 반영) | U4, requirements (하류 단계에서 FR6.1 문구 갱신) |

## Assumptions & Open Questions

- 외부 계약 C4·C5의 구체 스키마/라이브러리와 추천 임계값은 Functional Design/NFR 단계에서 확정한다. [assumption]
- FR6.1의 날씨 실패 표시 문구는 이 계약(C2 unknown 상태)에 맞춰 하류에서 "구름량 알 수 없음"으로 갱신한다. [assumption]
