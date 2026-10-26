# Logical Components — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: functional-design(entities/rules/functional-spec), nfr-requirements(tech-stack-decisions), security-design.md. NFR 설계 결정을 컴포넌트 수준 뷰로 연결(Infrastructure Design 가교).
> u1은 배포되는 서비스가 아니라 정적 번들에 임베드되는 순수 함수 라이브러리다.

## 논리 컴포넌트 인벤토리

| 컴포넌트 | 책임 | 격리/경계 | 공유 자원 |
|----------|------|-----------|-----------|
| `computeAstronomy` (진입점) | 입력 검증(SD1) → 계산 오케스트레이션 → 결과 조립 | 모듈 public 경계. 유일한 외부 진입점. | 없음 |
| 조도 계산 (내부) | 달 illuminated fraction 산출(BR1.1) | 내부 순수 함수 | 천문 라이브러리(읽기 전용 호출) |
| 박명/완전한 밤 계산 (내부) | 박명 3종·완전한 밤 구간 산출(BR2.1·BR2.2) | 내부 순수 함수 | 천문 라이브러리 |
| 월출/월몰 계산 (내부) | "그날 밤" 범위 판정 월출/월몰(BR3.1·BR3.2) | 내부 순수 함수 | 천문 라이브러리 |
| KST 변환/반올림 (내부) | UTC→KST ISO 변환, 표시 반올림(BR4.1·BR4.2) | 내부 순수 함수, 출력 경계에서만 적용 | 없음 |

## 실패 도메인·블라스트 반경

- **실패 도메인**: u1 전체가 단일 순수 함수 경계. 외부 의존은 천문 계산 라이브러리 하나(in-process). 라이브러리 오류나 잘못된 입력은 `computeAstronomy`가 `AstronomyComputationError`로 격리해 호출부에 전달한다.
- **블라스트 반경**: u1 실패는 해당 날짜 카드/상세의 천문 값에 국한된다. 순수 함수라 전역 상태 오염이 없고, 한 호출의 실패가 다른 호출에 영향을 주지 않는다(결정론적·독립적).
- **격리 전략**: 내부 계산 함수들은 `computeAstronomy` 뒤에 숨고, 외부로는 C1 계약(함수 시그니처·타입)만 노출한다. 천문 라이브러리 접근은 u1 내부로 캡슐화(U3·U4는 라이브러리를 직접 모른다).

## NFR 패턴 적용 위치

| NFR 패턴 | 적용 컴포넌트 |
|----------|---------------|
| 입력 검증 게이트(SD1) | `computeAstronomy` 진입점 |
| fail-fast·오류 격리 | `computeAstronomy`(천문 라이브러리 호출 래핑) |
| 순수성·부작용 없음(SD2) | 모든 내부 계산 함수 |

(성능/확장성/신뢰성/관측성 설계는 library kind에 미적용 — 배포 서비스가 아님. 이 단위엔 인프라 컴포넌트·스케일링·헬스체크가 없다.)

## Sources

- security-design.md(SD1·SD2), functional-spec.md(WF1), rules.md(BR1.1~BR5.1), tech-stack-decisions.md.

## Assumptions & Open Questions

None.
