# NFR Requirements — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: functional-design(functional-spec·rules), requirements.md(NFR4~NFR7), contract-summary.md(C2·C4).
> u2는 외부 무료 날씨 API를 소비하는 데이터 접근 라이브러리다. library kind라 적용 NFR 산출물은 security-requirements, tech-stack-decisions, traceability만.
> u1과 달리 u2는 외부 네트워크 호출이 있어 보안·무료 한도 고려가 더 있다. 아래는 핵심 공백만 묻는다.

## Q1. [아키텍트] 날씨 API 키·비밀값

A. 키가 필요 없는 공개 API(Open-Meteo 1순위)를 선택해 비밀값 자체를 두지 않는다(NFR6). 정적 앱이라 키를 숨길 서버가 없으므로 키 필요 API는 피한다. 만약 code-generation에서 키 필요 API만 가능하다고 판명되면 프록시 필요성을 그때 사람에게 제기 (권장)
B. 다른 방식
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 무료 한도 보호(NFR5) 요구

A. 앱 열 때 fetch + TTL 캐시로 호출을 억제하고(FR5.3), 14일 초과 먼 날짜는 호출하지 않는다(BR1.1). 동일 날짜·좌표 반복 조회는 캐시 히트로 처리. 이로써 무료 티어 호출 한도 안에서 동작하는 것을 NFR 목표로 둔다(정량 상한은 선택한 API의 무료 한도에 맞춰 code-generation에서 확인) (권장)
B. 다른 무료 한도 전략
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 입력 검증·보안 경계

A. 시스템 경계 입력 검증(dateKstId 형식·lat/lon 범위)에 집중. 외부 API 응답은 신뢰 경계 밖 데이터로 보고 어댑터가 파싱·검증 후 CloudForecast로 정규화한다(파싱 실패=unknown, BR2.1). 외부 응답을 그대로 호출부에 노출하지 않는다(BR2.2). 비밀값 없음(NFR6) (권장)
B. 추가 보안 고려
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 온라인 전제·가용성(NFR4)

A. u2는 온라인 전제로 동작한다(NFR4). 오프라인/네트워크 단절은 호출 실패=unknown으로 정규화해 앱이 멈추지 않게 한다(천문 정보는 u1이 오프라인에서도 계산). 오프라인 전용 영속 캐시는 두지 않는다(세션 메모리 캐시만) (권장)
B. 다른 가용성 모델
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
