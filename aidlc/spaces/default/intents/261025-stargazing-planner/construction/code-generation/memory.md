<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-10-26: BR1.3 불변식 확정 — FORECAST_HORIZON_DAYS=14 ≤ Open-Meteo forecast 범위 16일. types.ts 단일 상수로 분리하고 주석에 근거 기록. 컷오프(14일) 이내는 unknown, 초과는 outOfHorizon으로 두 상태가 겹치지 않음. 컷오프 날짜 비교는 KST epoch-day 인덱스 차로 결정적 수행(시각 세부 비의존).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations

- 2026-10-26: 리뷰 Minor #1 수정 — outOfHorizon 결과 캐시 TTL을 `min(긴 TTL, 다음 KST 자정까지)`로 제한. outOfHorizon 판정이 "오늘 KST"에 의존(BR1.1)하므로 자정을 넘기면 같은 날짜가 지평 안으로 들어와 stale outOfHorizon을 반환하던 엣지를 제거(weather.ts msUntilNextKstMidnight + 전용 테스트 1개). 테스트 31→32, 커버리지 93.64%. Minor #2(계획-산출 테스트 파일 드리프트)는 code-summary 편차 노트에 반영, Minor #3(index TTL 상수 비노출)은 의도된 공개 표면으로 현행 유지.

- 2026-10-26: 계획 기록 명령 `npx vitest run src/weather --coverage` 는 루트 v8 커버리지가 리포지토리 전체(.kiro 툴링 포함)를 집계해 핵심 모듈 플로어가 희석됨. 유닛 플로어 측정은 `--coverage.include='src/weather/**'` 로 경로를 한정해 실행함(vitest.config.ts 주석의 "단위 실행 명령이 경로를 한정" 의도와 일치). 기능·테스트 범위는 동일, 측정 방식만 명시.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
