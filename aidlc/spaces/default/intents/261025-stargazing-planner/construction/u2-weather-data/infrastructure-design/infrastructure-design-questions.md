# Infrastructure Design — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: nfr-design(security-design·logical-components), functional-spec, contract-summary, team.md(Deployment·Way of Working).
> u2는 배포 서비스가 아니라 정적 번들에 임베드되는 데이터 접근 라이브러리다. library kind라 인프라 산출물은 cicd-pipeline·traceability만. 자체 컴퓨트·네트워크·DB·모니터링 인프라가 없다.
> u1과 동일한 편입 구조. 아래는 u2에 특유한 CI/CD 최소 질문.

## Q1. [AWS/플랫폼] u2의 배포·CI/CD 위치

A. u2는 독립 배포 대상이 아니라 전체 정적 번들의 일부로 함께 빌드·배포된다. 별도 인프라·파이프라인 없이 앱 공통 CI/CD(main 머지 시 무료 정적 호스팅 자동 배포)에 편입한다. u1에서 만든 공용 파이프라인 설정을 재사용 (권장)
B. u2에 별도 파이프라인/인프라가 필요하다
X. Other (please specify)

[Answer]:A

## Q2. [AWS/플랫폼] u2 빌드 게이트(품질 체크)

A. 공통 파이프라인에서 u2에 적용되는 게이트: Prettier 포맷, ESLint, TypeScript 타입체크, u2 단위 테스트(핵심 계산 모듈 ~80% 커버리지). 실패 시 머지 차단. 비밀값 없음(키 불필요 API)이라 시크릿 스캔은 "하드코딩 시크릿 0건" 확인 수준. 외부 날씨 API는 런타임 의존이므로 빌드 게이트가 아니라 수동 스모크로 보완 (권장)
B. 다른 게이트 구성
X. Other (please specify)

[Answer]:A

## Q3. [AWS/플랫폼] 외부 API 런타임 의존·CI

A. u2가 의존하는 외부 날씨 API는 런타임 의존이며 CI에서 실제 호출하지 않는다(무료 한도·불안정성 회피). u2 단위 테스트는 어댑터 정규화 로직을 결정적으로 검증하되 실제 네트워크는 치지 않는다(실제 API 연동 확인은 수동 스모크). 롤백은 앱 공통 전략을 따른다(u2 단독 롤백 없음) (권장)
B. 다른 방식(예: CI에서 실제 API 스모크)
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
