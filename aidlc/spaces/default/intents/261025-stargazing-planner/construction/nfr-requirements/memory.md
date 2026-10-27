<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-10-27T06:50:46Z — [unit u4-web-ui] ui 단위라 produces_kinds상 performance·security·tech-stack·traceability만 생성(scalability/reliability/observability는 service 전용 미적용). NFR1(접근성)·NFR2(플랫폼)은 수치 요구가 아니라 UI 표시 정책이므로 traceability에서 N/A(functional-spec/code-generation에서 적용)로 두고, NFR3·NFR4(캐시 수명)·NFR5·NFR6만 OK로 커버. 차트 라이브러리는 functional-spec 가정대로 Chart.js+annotation으로 확정.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-26T15:46:00Z — [unit u3-domain-rules] 리뷰 iter1 READY(Major 1): NFR ID 교차참조 오류 수정. 성능 요구를 NFR5(비용)로 잘못 명명했던 것을 NFR3(성능)으로 바로잡고(NFR3.1), NFR5는 "외부 데이터 소스·키·유료 의존성 없음 → 무료 티어 자명 충족"으로 올바르게 매핑. NFR4(가용성)는 순수 라이브러리에 간접 적용임을 명시(U3는 실패 격리로만 기여, BR2.4).
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
