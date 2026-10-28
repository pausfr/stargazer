# Deployment Strategy — stargazing-planner

> 근거: deployment-pipeline-questions.md, team.md Deployment, NFR7, operation phase 가드레일.

## 전략: 단일 환경 재배포(recreate)

- 정적 번들(`dist-web/`)을 호스팅에 통째로 교체 게시한다. 이전 번들은 새 번들로 대체되고
  CDN이 새 자산을 서빙하면 전환 완료.
- 서버 인스턴스·트래픽 라우팅이 없으므로 점진 전략(blue/green·canary·rolling)과
  트래픽 전환 기준·중단 조건은 **해당 없음**(operation 가드레일의 blue/green·canary
  문서화 요구는 그 전략을 쓸 때만 적용).
- 데이터베이스 없음 → 마이그레이션·DB 롤백 전략 해당 없음.

## 배포 후 확인(스모크)

operation 가드레일: "프로덕션 배포는 성공을 확인할 스모크/헬스 체크가 있어야 한다."
정적 앱의 스모크는 다음으로 한다(Deployment Execution에서 실행):
- 공개 URL이 200으로 응답하고 `index.html`·메인 번들(JS/CSS)이 로드된다.
- 메인 목록 화면이 카드 형태로 렌더된다(맨 텍스트 아님).
- 상세 화면에서 차트가 보이고(달 체감 밝기 곡선·구름량·박명 음영·월출몰), 날씨 API 호출이
  브라우저에서 정상 동작한다.
- 다크모드·모바일 세로 레이아웃·한글 글리프 정상.

## 트리거·빈도

- `main` 머지 시마다 배포(연속적). 별도 릴리스 창·배치 없음.

## 보안 함의(operation 가드레일)

- 이 단계는 인프라 보안 통제를 제거·우회하지 않는다. 배포 권한은 호스팅/CI 최소 권한으로만
  부여하고, 애플리케이션 비밀값은 번들·배포 설정 어디에도 두지 않는다(NFR6.1).

## Sources

- deployment-pipeline-questions.md Q1·Q4, team.md Deployment, NFR7, phases/operation.md.

## Assumptions & Open Questions

None.
