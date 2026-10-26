# CI/CD Pipeline — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: infrastructure-design-questions.md(Q1~Q3), team.md(Deployment·Way of Working), nfr-design(security-design), tech-stack-decisions. u1과 동일한 편입 구조.
> u2는 독립 배포 대상이 아니라 전체 정적 번들의 일부다. 별도 파이프라인·인프라 없이 앱 공통 CI/CD에 편입한다.

## 배포 모델

u2는 정적 번들에 임베드되는 데이터 접근 라이브러리라 자체 배포 산출물이 없다. 전체 앱이 `main` 머지 시 무료 정적 호스팅에 자동 배포되며, u2는 그 번들에 함께 포함되어 배포된다(team.md Deployment). u2 단독 배포·단독 롤백 개념은 없다. u1에서 부트스트랩한 공용 파이프라인 설정을 재사용한다.

## 파이프라인 스테이지 → 게이트 (u2 적용분)

| 스테이지 | u2 게이트 | 실패 시 |
|----------|-----------|---------|
| Build | 전체 번들 빌드에 u2 TypeScript 컴파일 포함 | 머지 차단 |
| Lint/Format | Prettier + ESLint (team.md Code Style) | 머지 차단 |
| Type check | TypeScript 타입체크(C2 타입 계약 포함) | 머지 차단 |
| Test | u2 단위 테스트 실행 + 핵심 계산 모듈 ~80% 커버리지(team.md) | 머지 차단 |
| Secret scan | 하드코딩 시크릿 0건 확인(u2는 키 불필요 API라 자명) | 머지 차단 |

## 외부 API 런타임 의존과 CI (Q3)

- u2가 의존하는 외부 날씨 API는 **런타임 의존**이며 CI에서 **실제 호출하지 않는다**(무료 한도 소모·외부 불안정성 회피).
- u2 단위 테스트는 어댑터의 정규화 로직(known/outOfHorizon/unknown 분기, 파싱, 캐시 TTL)을 **네트워크 없이 결정적으로** 검증한다(외부 응답은 스텁/페이크 입력으로 주입). code-generation의 unit-test-instructions에 이 방침을 명시한다.
- 실제 API 연동 확인은 **수동 스모크**로 보완한다(team.md: UI·외부 API 연동은 수동 스모크).

## 배포 전략·환경 승격

- `main` 머지 시 전체 정적 번들 자동 배포(머지 시 배포, team.md). 단일 환경(무료 정적 호스팅), dev/staging/prod 분리 없음.
- 아티팩트는 정적 번들. u2는 번들에 트리셰이킹되어 포함.

## 롤백

u2 단독 롤백은 없다. 전체 앱 롤백 전략을 따른다(정적 호스팅 제공자의 이전 배포로 되돌리거나 `main` 직전 커밋 재배포, team.md).

## 시크릿 관리(CI/CD)

u2는 키 불필요 공개 API를 쓰므로 CI/CD에서 u2용 시크릿 주입이 없다(NFR6). 키 필요 API가 불가피해지면 전체 파이프라인 수준에서 프록시·시크릿 전략을 사람에게 제기(설계가 임의로 번들에 키를 넣지 않음).

## Sources

- infrastructure-design-questions.md(Q1~Q3), team.md(Deployment·Way of Working·Code Style), security-design.md(NFR6), tech-stack-decisions.md.

## Assumptions & Open Questions

- 전체 앱 공통 CI/CD의 구체 구성(호스팅·CI 러너)은 CI Pipeline/Deployment 단계 또는 전체 번들 패키징에서 확정. u2는 위 게이트를 그 공통 파이프라인에 편입하는 것으로 충분. [assumption]
