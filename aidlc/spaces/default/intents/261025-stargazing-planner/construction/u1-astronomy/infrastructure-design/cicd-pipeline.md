# CI/CD Pipeline — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: infrastructure-design-questions.md(Q1~Q3), team.md(Deployment·Way of Working), nfr-design(security-design), tech-stack-decisions.
> u1은 독립 배포 대상이 아니라 전체 정적 번들의 일부다. 별도 파이프라인·인프라를 두지 않고 앱 공통 CI/CD에 편입한다. 이 문서는 u1에 적용되는 빌드 게이트와 배포·롤백 편입 방식만 기술한다.

## 배포 모델

u1은 정적 번들에 임베드되는 라이브러리이므로 자체 배포 산출물이 없다. 전체 앱이 `main` 머지 시 무료 정적 호스팅에 자동 배포되며(team.md Deployment), u1은 그 번들에 함께 포함되어 배포된다. u1 단독 배포·단독 롤백 개념은 없다.

## 파이프라인 스테이지 → 게이트 (u1 적용분)

전체 앱 공통 파이프라인 중 u1에 적용되는 게이트:

| 스테이지 | u1 게이트 | 실패 시 |
|----------|-----------|---------|
| Build | 전체 번들 빌드에 u1 TypeScript 컴파일 포함 | 머지 차단 |
| Lint/Format | Prettier 포맷 체크 + ESLint (team.md Code Style) | 머지 차단 |
| Type check | TypeScript 타입체크(C1 타입 계약 포함) | 머지 차단 |
| Test | u1 단위 테스트 실행 + 핵심 계산 모듈 ~80% 라인 커버리지 플로어(team.md) | 머지 차단 |
| Secret scan | 하드코딩 시크릿 0건 확인(u1은 비밀값 미보유라 자명) | 머지 차단 |

## 배포 전략·환경 승격

- **배포 전략**: `main` 머지 시 전체 정적 번들 자동 배포(머지 시 배포, team.md). 별도 수동 프로덕션 승인 게이트 없음(1인 개인 앱).
- **환경**: 단일 환경(무료 정적 호스팅). dev/staging/prod 분리 없음.
- **아티팩트 관리**: 정적 번들 자체가 아티팩트. u1은 번들에 트리셰이킹되어 포함.

## 롤백

u1 단독 롤백은 없다. 전체 앱 롤백 전략을 따른다: 정적 호스팅 제공자의 이전 배포로 되돌리거나 `main`의 직전 커밋으로 재배포(team.md Deployment).

## 시크릿 관리(CI/CD)

u1은 비밀값을 쓰지 않으므로 CI/CD에서 u1용 시크릿 주입이 없다(NFR6). 전체 앱도 키 불필요 공개 API 우선 원칙(project.md)이라, 시크릿이 필요해지면 그때 전체 파이프라인 수준에서 결정한다.

## Sources

- infrastructure-design-questions.md(Q1~Q3), team.md(Deployment, Way of Working, Code Style), security-design.md(NFR6.1~6.3), tech-stack-decisions.md.

## Assumptions & Open Questions

- 전체 앱 공통 CI/CD의 구체 구성(어느 호스팅·어느 CI 러너)은 CI Pipeline/Deployment 단계 또는 전체 번들 패키징에서 확정. u1은 위 게이트를 그 공통 파이프라인에 편입하는 것으로 충분. [assumption]
