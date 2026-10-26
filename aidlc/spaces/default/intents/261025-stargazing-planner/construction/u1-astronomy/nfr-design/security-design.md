# Security Design — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: nfr-requirements/security-requirements.md(NFR6.1~NFR6.3), functional-design(rules.md BR5.1), tech-stack-decisions.md. 설계 수준(패턴·전략)만; 구현 코드는 code-generation.
> u1은 비밀값·인증·네트워크 없는 순수 계산 라이브러리다. 보안 설계의 전부는 "시스템 경계 입력 검증"이다.

## 보안 설계 결정

### SD1. 입력 검증 게이트 (NFR6.2, BR5.1)
- **패턴**: 모듈 진입점(computeAstronomy)에서 단일 검증 게이트. 검증 통과 전에는 계산 로직에 진입하지 않는다(fail-fast).
- **검증 항목**:
  - `dateKstId`: 정규식 `^\d{4}-\d{2}-\d{2}$` + 실재 날짜(월·일 범위) 확인.
  - `lat`: 숫자, [-90, 90].
  - `lon`: 숫자, [-180, 180].
  - `nightStartKst`/`nightEndKst`: 선택. 제공되면 둘 다 유효한 KST ISO 시각이고 start < end. 한쪽만 오면 오류(BR5.1). 둘 다 없으면 기본 범위(BR3.2).
- **실패 동작**: 조용히 실패하지 않고 `AstronomyComputationError{ code: "astronomy_failed", retryable: true, message }` 반환(결과 타입, 예외 선택은 code-generation). 호출부(U4)가 에러·재시도 UI 처리(WF2).
- **근거**: 구성 가드레일(경계 입력 검증·silent failure 금지), NFR6.2.

### SD2. 비밀값·네트워크 없음 (NFR6.1, NFR6.3)
- **결정**: u1은 어떤 비밀값도 보유·사용하지 않고(외부 호출 없음), 네트워크·파일·전역 가변 상태를 건드리지 않는 순수 함수로 설계한다.
- **설계 귀결**: 환경 변수·시크릿 매니저가 불필요. 공격 표면이 "입력 숫자/문자열"로 한정되어 SD1이 유일한 방어선이다.
- **근거**: NFR6.1, NFR6.3, ADR-001(백엔드 없음).

## 위협 모델 (요약)

| 위협 | u1 노출 | 완화 |
|------|---------|------|
| 입력 주입/조작 | 숫자·날짜 문자열 입력뿐 | SD1 검증 게이트 |
| 비밀값 유출 | 없음(비밀값 미보유) | SD2(비밀값 없음) |
| 부작용·데이터 유출 | 없음(순수 함수) | SD2(네트워크·IO 없음) |
| 인증·인가 우회 | 해당 없음(라이브러리) | — |

## Sources

- security-requirements.md (NFR6.1~NFR6.3), rules.md (BR5.1, BR3.2), tech-stack-decisions.md.

## Assumptions & Open Questions

- 검증 실패를 결과 타입으로 반환할지 예외로 던질지의 구체 형태는 code-generation에서 확정(설계상 "조용히 실패 안 함"만 고정). [assumption]
