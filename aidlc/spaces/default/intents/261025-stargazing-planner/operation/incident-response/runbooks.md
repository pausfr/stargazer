# Runbooks — stargazing-planner

> 1인 무료 정적 앱의 운영 런북. 서버가 없어 재시작·페일오버·스케일링 런북은 해당 없음.
> 근거: incident-response-questions.md Q3, rollback-runbook.md, functional-spec.md(저하 동작).

## RB1 — 사이트 다운 복구(P1)

증상: 공개 URL이 안 열리거나 앱이 뜨지 않음(흰 화면·콘솔 치명 오류).
1. 제공자 대시보드에서 최근 배포 상태 확인(실패 배포인지).
2. rollback-runbook.md 경로 A/B로 직전 정상 배포로 복원(제공자 이전 배포 promote, 또는 `main` 직전 커밋 revert 후 재배포).
3. 공개 URL에서 스모크(smoke-test-results.md) 재확인.
4. 원인(문제 커밋)을 로컬에서 `npx vite build`로 재현·수정 후 다시 올림.

## RB2 — 날씨 API 장애/무료 한도(P2)

증상: 가까운 날짜 카드/상세에 구름량이 안 나오고 "구름량 알 수 없음"/먼 날짜 안내가 뜸.
1. 이는 설계된 우아한 저하다(FR6.1, 상태 `unknown`/`outOfHorizon`). 앱은 달·박명·월출몰은 계속 표시.
2. 제공자(공개 날씨 API) 상태·한도를 확인. 일시 장애면 시간이 지나 자연 복구, 사용자 재방문·캐시로 흡수.
3. 지속 장애·한도 초과가 반복되면 다음 버전에서 대체 무료 API 또는 캐시 TTL 조정 검토(무료 범위 유지, project.md).
4. 코드 변경이 필요 없으면 조치 없음(저하가 정상 동작).

## RB3 — 배포 후 회귀 롤백(P1/P2)

증상: 배포 직후 화면/계산이 깨짐(예: 차트 미표시, 요약 오류).
1. 즉시 rollback-runbook.md로 직전 정상 배포 복원.
2. 로컬에서 회귀 재현 → 테스트 추가(가능하면) → 수정 → 재배포.
3. 재발 방지: 깨진 지점에 회귀 테스트를 더한다(핵심 계산이면 u1/u2/u3 테스트, UI면 순수 로직 테스트).

## 해당 없는 런북

- 서버 재시작·캐시 플러시(서버 캐시 없음, 브라우저 메모리 캐시만)·페일오버·오토스케일링: **N/A**(백엔드 없음).

## Sources

- incident-response-questions.md, rollback-runbook.md, functional-spec.md(§5 상태·저하), phases/operation.md(Incident Response).

## Assumptions & Open Questions

None.
