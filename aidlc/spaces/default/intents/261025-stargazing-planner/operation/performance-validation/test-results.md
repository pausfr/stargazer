# Performance Test Results — stargazing-planner

> 정량 부하 테스트 N/A. 수동 스모크 기반 체감 성능 검증 결과(게시 전 로컬 기준).
> 근거: load-test-plan.md, performance-design.md.

## 자동 부하 테스트

- **미수행(N/A)** — 측정할 서버 엔드포인트 없음(정적 앱).

## 로컬 체감 성능 확인(빌드·구조)

| 항목 | 방법 | 결과 |
|------|------|------|
| 번들 산출·크기 | `npx vite build` | JS 322KB(gzip 117KB), CSS 3.97KB, 배경 PNG 3.6MB |
| 점진 렌더 구조 | 코드 리뷰(PD1·PD2·PD3) | 스켈레톤·Promise.all 병렬·천문 우선·공유 캐시 반영 확인 |
| 단일 차트 인스턴스 | 코드 리뷰(PD4) | NightChart가 destroy/재생성 없이 data만 갱신 확인 |

- 네트워크 throttling 하 실제 체감 로딩의 최종 확인은 게시 후 공개 URL에서 수동 스모크로
  수행(load-test-plan.md 절차). 현재는 로컬 구조·빌드 확인까지.

## 관찰·개선 여지

- 배경 이미지 `milkyway_bg` 3.6MB가 번들 최대 자산. 초기 로딩 체감이 느리면 압축/WebP/
  지연 로딩으로 최적화 가능(다음 버전, 강제 목표 아님). 기능·게시엔 영향 없음.

## Sources

- load-test-plan.md, deployment-execution/deployment-log.md(번들 크기), performance-design.md.

## Assumptions & Open Questions

- 공개 URL 네트워크 throttling 스모크는 게시 후 수행. [assumption]
