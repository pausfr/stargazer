# Functional Design — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: unit-of-work.md(WeatherClient+DataCache), contract-summary.md(C2 CloudForecast 3-상태, C4 날씨 API 소비), requirements.md(FR5.1~FR5.3·FR6.1·FR6.3), stories(US1.3·US3.1·US4.1), components.md(WeatherClient·DataCache).
> 이 단위는 무료 날씨 API에서 구름량 예보를 가져오고(어댑터) 짧게 캐시하는 데이터 접근 라이브러리다. 설계 수준(엔티티·규칙·동작 명세)만 다루며 구현 코드는 code-generation에서.
> 계약 C2(상태 known/outOfHorizon/unknown)·C4(OpenAPI 소비, 어댑터 정규화)에서 많은 결정이 확정됨. 아래는 설계를 확정하기 위한 핵심 공백만 묻는다.

## Q1. [아키텍트] 구체 날씨 API 선정 방향

C4는 구체 API를 code-generation에서 확정하기로 했습니다(A2). u1에서 천문 라이브러리를 code-generation에서 확정한 것과 같은 방식으로, u2도 설계엔 추상 어댑터 계약만 두고 구체 API는 code-generation에서 정할까요?

A. 설계는 추상 어댑터(C4 OpenAPI 계약)로 두고, 구체 API는 tech-stack에 1순위(Open-Meteo: 키 불필요·무료·구름량 cloudcover 제공)+대안으로 기록해 code-generation에서 확정 (권장)
B. 지금 특정 API로 못박고 싶다
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 캐시(DataCache) 설계

FR5.3·NFR5(무료 한도 보호)에 따라 앱 열 때 fetch + 짧은 캐시입니다. 캐시를 어떻게 설계할까요?

A. 메모리 내 캐시(키=dateKstId+좌표), TTL 기반 만료. known 결과는 상대적으로 길게(예: 수십 분~1시간), unknown은 짧게(빠른 재시도 허용, nfr 교훈). 정적 앱이라 세션 범위 메모리 캐시로 충분 (권장)
B. 다른 캐시 전략(예: localStorage 영속 캐시)
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 상태 정규화 경계(known/outOfHorizon/unknown)

C2의 3-상태 판정 로직을 어디에 둘까요?

A. WeatherClient 어댑터가 외부 API 응답/실패를 받아 known/outOfHorizon/unknown으로 정규화한다. 예보 지평 판별은 요청 날짜가 API가 제공하는 예보 범위 안인지로 판정(지평 밖=outOfHorizon). 실패·타임아웃·파싱불가=unknown(reason은 로그용). 호출부(U3·U4)는 정규화된 CloudForecast만 본다 (권장)
B. 다른 경계 배치
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 예보 지평 판별 기준

예보 지평(가까운 날 vs 먼 날) 경계를 어떻게 정할까요?

A. 하드코딩된 날짜 경계를 두지 않고, 요청 날짜에 대해 API가 구름량 데이터를 반환하면 known, 범위 밖이라 데이터가 없으면 outOfHorizon으로 판정한다(C2 설계 전제·requirements FR2.2 주석과 일치, 경계값 무관 검증 가능) (권장)
B. 고정 일수 경계(예: 14일)로 판정
X. Other (please specify)

[Answer]:B(보완). 예보 지평은 오늘(KST) 기준 14일로 고정한다. 요청 날짜가 오늘+14일을 넘으면 API 호출 없이 outOfHorizon을 반환한다(불필요한 호출 절감, NFR5). 14일 이내인데 호출 실패·타임아웃·구름량 결측이면 unknown(outOfHorizon 아님)으로 반환한다. 경계값(14일)은 상수 하나로 분리해 API 예보 범위가 바뀌면 한 곳에서 조정한다.

## Q5. [아키텍트] 타임아웃·재시도

날씨 API 호출의 타임아웃과 재시도 정책입니다(C2·C4, FR6.1).

A. 합리적 타임아웃(예: 수 초) 후 실패는 unknown으로 정규화. u2 자체는 자동 재시도하지 않고(결과 타입으로 실패 전달), 재시도는 사용자 행동(화면 재진입)이 트리거. unknown은 짧은 TTL이라 재진입 시 재호출됨 (권장)
B. 다른 타임아웃/재시도 정책
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
