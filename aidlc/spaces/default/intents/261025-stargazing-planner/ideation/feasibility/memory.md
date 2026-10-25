<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-25T12:44:23Z — Q1로 "3개월 연휴 비교"와 "무료 날씨 API 예보 지평(보통 ~2주)"의 충돌을 해소: 가까운 날은 구름량 표시, 먼 날은 달 위상·박명만 확정하고 날씨는 가까워지면 채우는 구분 표시(A). 이것이 핵심 제약이자 설계 전제.
- 2026-10-25T12:44:23Z — Q2/Q4가 "알아서"라 달 밝기는 조도(illuminated fraction 0~100%)로, 데이터 갱신은 열 때 fetch + 짧은 캐시(무료 한도 보호)로 잠정 해석.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-25T12:44:23Z — Q5=A("가볍게, 핵심 화면 빠르게")와 intent-capture에서 확정한 "한국 ~5개 지역 구획 비교"는 모순이 아니라 노력 분량에 대한 선호로 해석했으나, 지역 구획이 범위에 남는지 Scope Definition에서 재확인 필요.
