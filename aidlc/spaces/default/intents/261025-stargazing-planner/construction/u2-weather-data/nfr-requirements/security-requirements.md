# Security Requirements — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: requirements.md(NFR4·NFR5·NFR6), functional-design(rules.md BR2.1·BR2.2·BR4.1), contract-summary.md(C2·C4), nfr-requirements-questions.md(Q1~Q4). 상위 NFR ID에 서브넘버.
> u2는 외부 무료 날씨 API를 소비하는 데이터 접근 라이브러리다. 보안 초점: 비밀값 없음, 경계 입력/응답 검증, 무료 한도 보호.

## 보안 요구

| ID | 요구 | 근거 | 측정/판정 |
|----|------|------|-----------|
| NFR6.1 | u2는 키가 필요 없는 공개 API(Open-Meteo 1순위)를 사용해 비밀값을 두지 않는다. code-generation에서 키 필요 API만 가능하다고 판명되면 프록시 필요성을 사람에게 제기한다. | NFR6, project.md Forbidden, Q1 | 코드/번들에 하드코딩된 시크릿 0건. 선택 API가 키 불필요임을 확인. |
| NFR6.2 | 시스템 경계 입력 검증: dateKstId 형식·lat/lon 범위를 검증한다. 검증 실패 시 C2 `throws: never` 계약과 정합하게 예외를 던지지 않고, status=unknown(reason에 "invalid input" 사유 기록)으로 정규화해 반환한다(외부 호출 없이). 조용히 실패하지 않는다. | 구성 가드레일(경계 입력 검증), Q3, C2, BR2.1 | 잘못된 입력(형식 오류·범위 밖)이 외부 호출 없이 unknown으로 반환되고 reason이 기록됨을 단위 테스트로 검증. |
| NFR6.3 | 외부 API 응답은 신뢰 경계 밖 데이터로 취급한다. 어댑터가 파싱·검증 후 CloudForecast로 정규화하며(파싱 실패=unknown), 외부 응답 형식을 호출부에 그대로 노출하지 않는다. | BR2.1·BR2.2, Q3 | 파싱 실패/예상 밖 응답이 unknown으로 정규화됨을 테스트로 검증. |

## 무료 한도·가용성 관련 보안 인접 요구

| ID | 요구 | 근거 | 판정 |
|----|------|------|------|
| NFR5.1 | 무료 티어 호출 한도 안에서 동작한다: 앱 열 때 fetch + TTL 캐시로 호출 억제, 14일 초과 먼 날짜는 호출 안 함. 정량 상한은 선택한 API 무료 한도에 맞춰 code-generation에서 확인. | NFR5, FR5.3, BR1.1·BR3.1, Q2 | 동일 날짜·좌표 반복 조회가 캐시 히트로 처리되고 먼 날짜가 호출을 발생시키지 않음을 테스트로 확인. |
| NFR4.1 | 온라인 전제로 동작하되 네트워크 단절·호출 실패는 unknown으로 정규화해 앱이 멈추지 않는다. 오프라인 전용 영속 캐시는 두지 않는다(세션 메모리 캐시만). | NFR4, BR2.1·BR3.1, Q4 | 호출 실패 시 unknown 반환·앱 비차단을 테스트로 확인. |

## 위협 고려

| 위협 | u2 노출 | 완화 |
|------|---------|------|
| 비밀값 유출 | 키 불필요 API 선택 시 없음 | NFR6.1(비밀값 없음) |
| 악성/오염된 외부 응답 | 외부 API 응답 파싱 | NFR6.3(경계 검증·정규화, 실패=unknown) |
| 입력 조작 | dateKstId·좌표 입력 | NFR6.2(경계 검증) |
| 무료 한도 초과 | 과도 호출 | NFR5.1(캐시·컷오프) |

## Sources

- NFR4·NFR5·NFR6 (requirements.md), rules.md(BR1.1·BR2.1·BR2.2·BR3.1·BR4.1), contract-summary.md(C2·C4), nfr-requirements-questions.md(Q1~Q4).

## Assumptions & Open Questions

- 선택 API의 구체 무료 호출 한도 수치는 code-generation에서 확인·확정(A2). [assumption]
