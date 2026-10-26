# Team Allocation — 별 보기 좋은 날 추천 앱

> 근거: team-practices(1인 개발), units-generation, bolt-plan.md. Team Formation(1.5) 단계는 이 워크플로에서 건너뛰었다.
> **mob** = 하나의 Bolt를 함께 만드는 담당 팀(드라이버·내비게이터 등). 이 프로젝트는 1인·AI 개발이므로 사람 mob 구성 대신 단일 담당으로 둔다.

## 담당 배정

Team Formation을 건너뛰었으므로(1인 프로젝트), 모든 Bolt는 **개발자 에이전트(aidlc-developer-agent, AI)**가 수행한다. 사람 mob 구성이나 Program Board(팀이 2개 이상일 때의 조율 보드)는 해당 없음.

| Bolt | 담당 | 비고 |
|------|------|------|
| Bolt 1 (워킹 스켈레톤) | aidlc-developer-agent (AI) | U1·U3·U4 최소 슬라이스, 날씨 스텁 |
| Bolt 2 (날씨 연동) | aidlc-developer-agent (AI) | U2 어댑터+캐시 |
| Bolt 3 (기능 완성) | aidlc-developer-agent (AI) | U1·U3·U4 나머지 |

## 조율·검토

- 1인 프로젝트이므로 기능별 브랜치나 PR 리뷰 같은 무거운 협업 절차는 두지 않는다(team-practices Way of Working). 변경 근거는 커밋 메시지로 남긴다.
- 사람(프로젝트 소유자)은 각 단위 완료 체크포인트와 승인 게이트에서 검토·승인한다.

## Assumptions & Open Questions

None.
