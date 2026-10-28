# SLO Report — stargazing-planner

> 게시 전 베이스라인 SLO 보고. 실제 운영 데이터는 게시 후 쌓인다. 근거: slo-config.md,
> performance-validation/nfr-validation-matrix.md.

## SLO 현황(게시 전)

| SLI | SLO 목표 | 현재 상태 |
|-----|----------|-----------|
| 가용성 | 30일 롤링 윈도우 99% 이상 200 응답 | 미측정(게시 후 제공자 업타임·선택적 업타임 체크로 집계 시작) |
| 앱 로드 성공 | 콘솔 치명 오류 0·메인 목록 렌더 | 로컬 빌드·테스트 green(167개), 공개 스모크는 게시 후 |

## 오류 예산

- 99%/30일 → 월 약 7.2시간 다운 허용. 게시 전이라 소진 0. 번레이트 경보·피처 프리즈
  정책은 두지 않음(1인 개인 앱, slo-config.md).

## 평가

- 코드·구조 측 준비 완료(테스트·커버리지·빌드 green). 가용성 SLO는 선택한 무료 호스팅
  제공자의 업타임에 사실상 의존하며, 게시 후 첫 30일 윈도우부터 실측을 시작한다.

## Sources

- slo-config.md, performance-validation/nfr-validation-matrix.md, build-and-test/test-results.md.

## Assumptions & Open Questions

- 실측 가용성은 게시 후 집계. [assumption]
