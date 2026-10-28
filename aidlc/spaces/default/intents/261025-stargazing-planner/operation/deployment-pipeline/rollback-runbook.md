# Rollback Runbook — stargazing-planner

> 모든 배포 절차는 되돌리는 단계를 포함한다(operation 가드레일). 정적 웹 앱이라
> 롤백은 "이전 정적 번들로 되돌리기"이며 데이터 롤백은 없다. 근거: team.md Deployment,
> deployment-pipeline-questions.md Q4.

## 롤백 트리거(언제 되돌리나)

- 배포 후 스모크(deployment-strategy.md) 실패: 공개 URL 비정상, 화면 미렌더(맨 텍스트),
  차트 미표시, JS 오류로 앱이 뜨지 않음.
- 배포 직후 명백한 회귀(핵심 화면/계산이 깨짐)를 사용자가 확인.

## 롤백 절차(둘 중 빠른 쪽)

### 경로 A — 호스팅 제공자 이전 배포 복원(권장, 즉시)
- **GitHub Pages**: 직전 성공 배포로 되돌리려면 `main`을 직전 정상 커밋으로 revert 후
  재배포(Pages는 브랜치 기준이라 커밋 되돌림이 사실상의 복원). 또는 Pages 배포 히스토리에서
  재실행.
- **Vercel/Netlify**: 대시보드의 Deployments에서 직전 성공 배포를 "Promote/Rollback"으로
  즉시 복원(재빌드 없이 이전 번들 서빙).

### 경로 B — `main` 직전 정상 커밋으로 재배포
1. `git revert <문제 커밋>`(또는 직전 정상 커밋으로 되돌리는 revert 커밋 작성).
2. `main`에 푸시 → CI 품질 게이트 통과 → 자동 재배포.
3. 공개 URL에서 스모크 재확인.

> 둘 다 정적 번들 교체라 수 분 내 완료. DB·세션·마이그레이션 롤백 없음(상태 비보유 정적 앱).

## 롤백 후 확인

- 공개 URL 200 + 메인/상세 화면 정상 렌더 + 차트 표시 + 날씨 호출 동작.
- 문제 커밋을 다시 올리기 전, 로컬 `npx vite build` + 브라우저 스모크로 재현·수정 확인.

## 에스컬레이션·사후 검토(operation 가드레일)

- 1인 프로젝트라 에스컬레이션 경로는 개발자 본인. 연락 체계 불필요.
- 롤백을 유발한 회귀는 원인(어떤 커밋·어떤 변경)·재발 방지(테스트 추가 여부)를
  커밋 메시지 또는 이 런북 하단에 한 줄로 남긴다.

## 비고

- 자동 롤백(헬스 체크 기반 임계값)은 단일 정적 호스팅에선 과하므로 두지 않는다. 수동 복원이
  즉시 가능하고 영향 범위가 공개 페이지 하나로 한정된다.

## Sources

- team.md Deployment(롤백=이전 배포 복원/직전 커밋 재배포), deployment-pipeline-questions.md Q4, phases/operation.md(Deployment Procedures·Incident Response).

## Assumptions & Open Questions

None.
