# Environment Validation Report — stargazing-planner

> 단일 정적 호스팅 환경에 대한 설정·보안 검증. AWS 특유 항목(VPC/Secrets/교차 계정)은
> 해당 없음. operation 가드레일(Infrastructure Safety) 기준 보안 함의도 함께 기록.

## 검증 항목

| 항목 | 결과 | 비고 |
|------|------|------|
| 환경이 Infra Design대로인가 | PASS | 단일 정적 호스팅 1개, 정적 번들 서빙 — 설계와 일치 |
| VPC/서브넷/SG/NACL 정합 | N/A | 정적 호스팅은 사용자 네트워크 토폴로지 없음(제공자 CDN) |
| Secrets/Parameter Store 주입 | N/A | 앱 비밀값 없음(NFR6.1). 번들·호스팅에 시크릿 미포함 |
| 교차 계정/교차 VPC 연결 | N/A | 단일 호스팅·백엔드 없음 |
| HTTPS 기본 제공 | PASS(예정) | 세 제공자 모두 기본 HTTPS. 연결 시 확인 |
| 로컬 빌드 산출 = 운영 번들 | PASS | `npx vite build` → `dist-web/`, 패리티 이슈 없음 |

## 보안 posture 검증(operation 가드레일: Infrastructure Safety)

- 기존 보안 통제를 제거·우회하지 않음. 배포 권한은 호스팅/CI 최소 권한으로만 부여.
- 번들에 시크릿·API 키 없음(NFR6.1, project.md Forbidden) — 소스 전수 확인(Build and Test·code-generation에서 검증됨).
- 외부 런타임 호출은 브라우저 → 공개 날씨 API 한 방향, HTTPS. 서버 측 비밀 교환 없음.
- IAM 역할·네트워크 정책·암호화 설정 변경 없음(해당 리소스 자체가 없음) → 위험 평가 N/A.

## 미결·이월

- 호스팅 제공자 최종 선택·실제 연결·공개 URL 확보는 Deployment Execution 단계에서.
- NFR3(체감 로딩) 정량 검증은 performance-validation 단계.

## Sources

- environment-inventory.md, infrastructure-specification.md, cd-config.md, team.md Deployment, phases/operation.md(Infrastructure Safety), project.md(비밀값 금지).

## Assumptions & Open Questions

None.
