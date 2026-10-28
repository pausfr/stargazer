# Health Check Report — stargazing-planner

> 정적 웹 앱이라 "헬스 체크"는 서버 엔드포인트 핑이 아니라 공개 페이지가 정상 로드·동작하는지다.
> 선택 Q1=A(미게시)이므로 공개 헬스 체크는 게시 후 수행 예정. 근거: deployment-strategy.md.

## 헬스 지표(정적 앱)

| 지표 | 정의 | 확인 방법 |
|------|------|-----------|
| 가용성 | 공개 URL이 200으로 응답 | 브라우저/`curl -I <url>`(게시 후) |
| 앱 로드 | JS 번들 로드 후 `#app`에 UI 렌더 | 브라우저 콘솔 오류 0, 메인 목록 표시 |
| 외부 데이터 | 공개 날씨 API 호출 성공률 | 브라우저 네트워크 탭(가까운 날짜 구름량 채워짐) |
| 오류율 | 브라우저 콘솔/런타임 오류 | 콘솔 오류 없음 |

## 현재 상태

- **미게시(Q1=A).** 공개 헬스 체크 대상(URL)이 아직 없음 → 게시 후 수행.
- 로컬 번들은 정상 산출·로드 가능(deployment-log.md).

## 게시 후 헬스 확인(사용자 수행)

1. 공개 URL `curl -I`로 200 확인.
2. 브라우저에서 앱 로드·콘솔 오류 0·메인 목록 렌더 확인.
3. 가까운 날짜 상세에서 날씨 API 호출 성공(구름량 곡선) 확인.

## SLO/알림(operation 가드레일)

- 정량 SLO·알림 임계값은 Observability Setup 단계에서 정의(이 1인 무료 정적 앱의 맥락에
  맞는 가벼운 수준). 이 단계는 게시 가능 상태와 헬스 지표 정의까지.

## Sources

- deployment-strategy.md, deployment-log.md, phases/operation.md(Observability·Deployment Procedures).

## Assumptions & Open Questions

- 공개 URL·정량 SLO는 각각 사용자 게시·Observability Setup에서 확정. [assumption]
