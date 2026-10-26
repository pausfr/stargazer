# Security Requirements — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: requirements.md(NFR6), functional-design(rules.md BR5.1), nfr-requirements-questions.md(Q3·Q4). 상위 NFR ID에 서브넘버를 붙여 추적.
> u1은 비밀값·인증·외부 네트워크 호출이 없는 순수·결정론적 계산 라이브러리다. 보안 초점은 시스템 경계 입력 검증이다.

## 보안 요구

| ID | 요구 | 근거 | 측정/판정 |
|----|------|------|-----------|
| NFR6.1 | u1은 API 키·토큰 등 어떤 비밀값도 코드/번들에 두지 않는다. u1은 외부 호출이 없으므로 비밀값 자체가 발생하지 않는다. | NFR6, project.md Forbidden | 코드에 하드코딩된 시크릿 0건(린터/수동 점검). |
| NFR6.2 | 시스템 경계 입력 검증: computeAstronomy 입력(dateKstId 형식 YYYY-MM-DD, lat∈[-90,90], lon∈[-180,180], nightStart/End 쌍 일관성)을 검증하고, 유효하지 않으면 조용히 실패하지 않고 AstronomyComputationError(retryable)로 전달한다. | 구성 가드레일(입력 검증·silent failure 금지), BR5.1, FR6.2 | 잘못된 입력 각각에 대해 오류 반환을 단위 테스트로 검증. |
| NFR6.3 | u1은 네트워크·파일·전역 상태 부작용이 없는 순수 함수다. 외부로 데이터를 전송하지 않으며 입력만으로 결정론적 출력을 만든다. | ADR-001(백엔드 없음), functional-spec(상태 없음) | 네트워크/IO 호출 0건(코드 리뷰·린터). |

## 위협 고려 (해당 없음/낮음)

- **주입·부작용**: u1은 결정론적 순수 계산이라 명령 주입·SQL·파일 경로 조작 표면이 없다. 유일한 외부 입력은 숫자·날짜 문자열이며 NFR6.2 검증으로 차단.
- **인증·인가**: u1에 없음(라이브러리, 사용자 개념 없음).
- **데이터 보호·개인정보**: u1은 PII를 다루지 않는다(좌표는 전국 대표 좌표 하나, 사용자 위치 아님).

## Sources

- NFR6 (requirements.md): 비밀값 비하드코딩, 키 불필요 공개 API 우선.
- 구성 가드레일: 경계 입력 검증, silent failure 금지.
- BR5.1 (rules.md): 유효하지 않은 입력은 오류로 전달.

## Assumptions & Open Questions

None.
