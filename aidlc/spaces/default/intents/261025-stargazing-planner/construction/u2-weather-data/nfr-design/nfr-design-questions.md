# NFR Design — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: nfr-requirements(security-requirements·tech-stack-decisions), functional-spec, contract-summary(C2·C4).
> u2는 외부 무료 날씨 API를 소비하는 데이터 접근 라이브러리다. library kind라 설계 산출물은 security-design·logical-components·traceability만(성능/확장성/신뢰성/관측성 설계는 service/ui 전용).
> NFR Requirements에서 보안·무료한도·가용성이 확정됨. 아래는 설계 패턴 확정을 위한 최소 질문.

## Q1. [아키텍트] 보안 설계의 초점

A. 두 경계 방어에 집중: ① 진입점 입력 검증(dateKstId 형식·lat/lon 범위, 실패 시 예외 없이 unknown 정규화, NFR6.2) ② 외부 API 응답을 비신뢰 데이터로 보고 어댑터가 파싱·검증 후 CloudForecast로 정규화(파싱 실패=unknown, 외부 응답 비노출). 비밀값·키 없음(NFR6.1) (권장)
B. 추가 보안 패턴이 필요하다
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 복원력·무료 한도 패턴(resilience)

u2는 외부 API에 의존하므로 실패·한도 보호 패턴이 중요합니다.

A. 타임아웃(AbortController) + 단일 호출(자동 재시도 없음, 사용자 재진입이 트리거) + TTL 캐시(known/outOfHorizon 길게, unknown 짧게) + 14일 사전 컷오프로 호출 억제. 실패는 결과 타입(unknown)으로 격리해 앱 비차단. 서킷 브레이커 같은 무거운 패턴은 1인·무료 앱엔 과함 (권장)
B. 다른 복원력 패턴(예: 서킷 브레이커)
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 논리 컴포넌트 경계·격리

A. WeatherClient(어댑터, 외부 호출+정규화)와 DataCache(TTL 캐시)를 u2 내부 2개 논리 컴포넌트로 두고, getCloudForecast를 유일 public 진입점으로 둔다. 외부 API 접근은 WeatherClient에 캡슐화해 U3·U4가 직접 모르게 한다. 실패는 unknown으로 격리, 블라스트 반경은 해당 날짜 조회로 한정 (권장)
B. 다른 컴포넌트 경계
X. Other (please specify)

[Answer]:A

## Q4. [아키텍트] 성능/확장성/신뢰성/관측성 설계

A. u2는 library kind이고 배포 서비스가 아니므로 성능·확장성·신뢰성·관측성 설계 산출물은 미적용(produces_kinds). 캐시·타임아웃은 Q2의 복원력 패턴으로 security-design/logical-components에 담고, 별도 스케일링·헬스체크·메트릭 설계는 불필요 (권장)
B. 일부가 필요하다
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
