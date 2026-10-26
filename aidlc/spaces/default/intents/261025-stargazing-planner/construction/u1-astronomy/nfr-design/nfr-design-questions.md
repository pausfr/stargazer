# NFR Design — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: nfr-requirements(security-requirements·tech-stack-decisions), functional-design(functional-spec·rules), contract-summary(C1·C5).
> u1은 비밀값·네트워크 없는 순수 계산 라이브러리다. library kind라 설계 산출물은 security-design·logical-components·traceability만(성능/확장성/신뢰성/관측성 설계는 service/ui 전용). 아래는 설계 패턴 확정을 위한 최소 질문.

## Q1. [아키텍트] 보안 설계의 초점

A. 시스템 경계 입력 검증(진입점 단일 게이트, fail-fast)에 보안 설계를 집중한다. 비밀값·네트워크 없음은 설계 결정으로 고정. 검증 항목: dateKstId 형식·실재 날짜, lat/lon 범위, night 경계 쌍 일관성. 실패는 조용히 실패하지 않고 오류로 전달(BR5.1) (권장)
B. 추가 보안 패턴이 필요하다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Q2. [아키텍트] 논리 컴포넌트 경계·격리

A. computeAstronomy를 유일한 public 진입점으로 두고 내부 계산 함수(조도·박명·월출몰·KST 변환)를 그 뒤에 캡슐화. 천문 라이브러리 접근은 u1 내부로 숨겨 U3·U4가 직접 모르게 한다. 실패는 AstronomyComputationError로 격리, 블라스트 반경은 해당 호출로 한정(순수 함수) (권장)
B. 다른 컴포넌트 경계
X. Other (please specify)

[Answer]:A

## Q3. [아키텍트] 성능/확장성/신뢰성/관측성 설계

A. u1은 library kind이고 배포 서비스가 아니므로 성능·확장성·신뢰성·관측성 설계 산출물은 미적용(produces_kinds). 결정론적 로컬 계산이라 캐싱·스케일링·헬스체크·메트릭이 불필요 (권장)
B. 일부가 필요하다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
