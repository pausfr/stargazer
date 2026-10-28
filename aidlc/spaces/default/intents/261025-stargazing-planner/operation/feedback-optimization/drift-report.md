# Drift Report — stargazing-planner

> 근거: feedback-optimization-questions.md Q3, environment-inventory.md.

## 드리프트 탐지

- **해당 없음(N/A)** — IaC(CDK/CloudFormation/Terraform)로 관리하는 서버·클라우드
  리소스가 없다. 정적 호스팅 환경은 제공자가 관리하고, 사용자가 구성하는 인프라 리소스가
  없어 "정의 ↔ 실제" 드리프트 개념이 적용되지 않는다.

## 단일 소스(배포 산출물)

- 배포되는 것은 `main` 브랜치에서 `npx vite build`로 나온 `dist-web/`뿐이다. 콘솔에서
  수동으로 바꿀 인프라 설정이 없으므로 드리프트가 생길 표면이 없다.
- 호스팅 설정(빌드 명령·출력 디렉터리·도메인)은 제공자 대시보드에서 한 번 지정하며,
  변경 시 커밋/대시보드 이력으로 추적된다.

## Sources

- feedback-optimization-questions.md Q3, environment-inventory.md, cd-config.md.

## Assumptions & Open Questions

None.
