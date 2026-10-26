# Security Design — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: nfr-requirements(security-requirements NFR6.1~6.3·NFR5.1·NFR4.1), functional-spec(WF1), rules(BR2.1·BR2.2·BR4.1), contract-summary(C2·C4), nfr-design-questions.md(Q1·Q2). 설계 수준(패턴)만; 구현 코드는 code-generation.
> u2는 외부 무료 날씨 API를 소비하는 데이터 접근 라이브러리다. 보안 설계는 두 신뢰 경계(입력·외부 응답) 방어 + 복원력에 집중한다.

## 보안 설계 결정

### SD1. 진입점 입력 검증 게이트 (NFR6.2, BR2.1)
- **패턴**: getCloudForecast 진입점에서 단일 검증 게이트(fail-fast). dateKstId 형식(YYYY-MM-DD·실재 날짜), lat∈[-90,90], lon∈[-180,180] 검증.
- **실패 동작**: C2 `throws: never` 계약과 정합하게 예외를 던지지 않고, 외부 호출 없이 status=unknown(reason="invalid input") 정규화 반환. 조용히 실패하지 않는다.
- **근거**: NFR6.2, BR2.1(입력 측면 — 유효하지 않은 입력을 unknown으로), 구성 가드레일(경계 입력 검증).

### SD2. 외부 응답 비신뢰 경계 (NFR6.3, BR2.1·BR2.2)
- **패턴**: 외부 API 응답을 신뢰 경계 밖 데이터로 취급. WeatherClient 어댑터가 응답을 파싱·검증한 뒤에만 CloudForecast로 정규화한다. 예상 밖 형식·파싱 불가·구름량 결측은 status=unknown(reason에 사유).
- **비노출**: 외부 API의 원형 응답·오류 객체를 호출부(U3·U4)에 그대로 노출하지 않는다. 호출부는 C2의 3-상태 CloudForecast만 본다.
- **근거**: NFR6.3, BR2.1(응답 측면 — 파싱 불가/결측을 unknown으로), BR2.2.

### SD3. 비밀값·네트워크 표면 최소화 (NFR6.1)
- **결정**: 키 불필요 공개 API(Open-Meteo 1순위)를 선택해 비밀값 자체를 두지 않는다. 환경 변수·시크릿 매니저 불필요. code-generation에서 키 필요 API만 가능하면 프록시 필요성을 사람에게 제기(설계가 임의로 키를 번들에 넣지 않음).
- **네트워크 표면**: 외부 호출은 WeatherClient 하나로 한정(단일 egress 지점).
- **근거**: NFR6.1, project.md Forbidden.

## 복원력 설계 (Q2) — 무료 한도·실패 격리

| 패턴 | 설계 | 근거 |
|------|------|------|
| 타임아웃 | fetch + AbortController로 수 초 타임아웃. 초과=unknown. | BR4.1, NFR4.1 |
| 단일 호출(재시도 없음) | u2는 자동 재시도하지 않음. 실패를 결과 타입(unknown)으로 격리해 앱 비차단. 재시도는 사용자 재진입. | BR3.2 |
| TTL 캐시 | known/outOfHorizon 길게, unknown 짧게. 동일 날짜·좌표 반복 조회는 캐시 히트. | BR3.1, NFR5.1 |
| 14일 사전 컷오프 | 14일 초과 먼 날짜는 호출 없이 outOfHorizon(BR1.1). 불변식: 컷오프 ≤ 실제 API 범위(BR1.3). | BR1.1·BR1.3, NFR5.1 |

서킷 브레이커·백오프 큐 같은 무거운 복원력 패턴은 1인·무료 정적 앱 규모에 과하여 채택하지 않는다(Q2). 실패는 조용히 삼키지 않고 unknown으로 표면화한다(구성 가드레일).

## 위협 모델 (요약)

| 위협 | u2 노출 | 완화 |
|------|---------|------|
| 입력 조작 | dateKstId·좌표 | SD1 검증 게이트 |
| 오염/예상 밖 외부 응답 | 외부 API 응답 | SD2 비신뢰 경계·정규화 |
| 비밀값 유출 | 키 불필요 API면 없음 | SD3 |
| 무료 한도 초과·호출 폭주 | 과도 호출 | 복원력 설계(캐시·컷오프·단일 호출) |
| 외부 장애로 앱 멈춤 | 호출 실패 | 타임아웃+unknown 격리(앱 비차단) |

## Sources

- security-requirements.md(NFR6.1~6.3·NFR5.1·NFR4.1), rules.md(BR1.1·BR1.3·BR2.1·BR2.2·BR3.1·BR3.2·BR4.1), tech-stack-decisions.md, contract-summary.md(C2·C4).

## Assumptions & Open Questions

- 검증 실패·타임아웃·파싱불가의 구체 구현 형태는 code-generation에서 확정(설계상 "예외 없이 unknown 정규화"만 고정). [assumption]
