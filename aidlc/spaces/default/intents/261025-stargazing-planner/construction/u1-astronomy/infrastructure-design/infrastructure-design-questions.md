# Infrastructure Design — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: nfr-design(security-design·logical-components), functional-spec, contract-summary, team.md(Deployment·Way of Working).
> u1은 배포 서비스가 아니라 정적 번들에 임베드되는 순수 계산 라이브러리다. library kind라 인프라 산출물은 cicd-pipeline·traceability만(infrastructure-specification·monitoring-design은 service/ui/packaging 전용). 자체 컴퓨트·네트워크·DB·모니터링 인프라가 없다.
> 아래는 u1의 CI/CD 관련 최소 질문.

## Q1. [AWS/플랫폼] u1의 배포·CI/CD 위치

A. u1은 독립 배포 대상이 아니라 전체 정적 번들의 일부로 함께 빌드·배포된다. 별도 인프라·파이프라인을 두지 않고, 전체 앱의 공통 CI/CD(main 머지 시 무료 정적 호스팅 자동 배포, team.md Deployment)에 편입한다. u1 수준에서는 "린트·타입체크·단위 테스트가 공통 파이프라인의 빌드 게이트에 포함된다"만 명시 (권장)
B. u1에 별도 파이프라인/인프라가 필요하다 (자유 기술)
X. Other (please specify)

[Answer]:A

## Q2. [AWS/플랫폼] u1 빌드 게이트(품질 체크)

A. 공통 파이프라인에서 u1에 적용되는 게이트: Prettier 포맷 체크, ESLint, TypeScript 타입체크, u1 단위 테스트(핵심 계산 모듈 ~80% 커버리지 플로어, team.md). 실패 시 머지 차단. 비밀값 없음이라 시크릿 스캔은 "하드코딩 시크릿 0건" 확인 수준 (권장)
B. 다른 게이트 구성
X. Other (please specify)

[Answer]:A

## Q3. [AWS/플랫폼] 롤백

A. u1은 전체 번들의 일부이므로 롤백은 앱 공통 전략을 따른다(정적 호스팅 제공자의 이전 배포로 되돌리거나 main 직전 커밋 재배포, team.md). u1 단독 롤백 개념 없음 (권장)
B. 다른 롤백 전략
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
