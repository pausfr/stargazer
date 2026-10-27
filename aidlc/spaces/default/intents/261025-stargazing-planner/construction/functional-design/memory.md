<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-26T14:07:44Z — [unit u2-weather-data] 예보 지평 판별을 2단계로 합침(사용자 Q4 보완 + Q3 응답기반을 조정자가 통합, 사용자 1번 승인): ① 요청일 > 오늘(KST)+14일이면 API 호출 없이 outOfHorizon(호출 절감, NFR5) ② 14일 이내면 호출해 구름량 있으면 known, 실패/타임아웃/파싱불가/결측이면 unknown. 14일은 상수 1개로 분리. outOfHorizon은 "14일 초과"로만, unknown은 "14일 이내 실패/결측"으로 명확히 분리.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-27T13:15Z — [unit u4-web-ui] 2차 체크포인트 반려 반영(5건). 핵심은 달 밝기 표현 설계 번복: 수평 기준선 → **시간별 체감 밝기 곡선**. 사용자가 짚은 대로, 하룻밤 사이 변하는 건 위상(illuminated fraction)이 아니라 달 고도에 따른 대기소광×입사각 체감 밝기(월출/월몰 근처 남중 대비 수%). 앱 핵심 가치에 이게 중요하므로 C1 계약에 moonHourly[]{hourKst,altitudeDeg,relativeBrightnessPct} 추가(U1 계산, 남중=100% 상대), moonIlluminationPct 위상값은 요약용 유지. functional-spec §2.1·§4, frontend-components §4·§5.5 갱신. 함께: x축 KST HH:MM 포맷(계산 epoch 분리), 박명 음영 농도 차등(시민<항해<천문<완전한 밤)+box 내부 라벨, 요약 월출/월몰 라벨+값 중복 제거. 월출/월몰 비대칭 버그(6)는 u1 code-generation에서 수정. 사용자가 u4 체인에서 u1까지 함께 수정하는 경로 선택.
- 2026-10-27T12:37:49Z — [unit u4-web-ui] 체크포인트 사람 반려(실제 화면이 맨 텍스트). 원인: 앞선 code-gen이 컴포넌트 className은 붙였으나 대응 CSS를 작성하지 않음(index.html에 테마 변수만, 컴포넌트 스타일 전무). 근본 공백은 설계에 있었음 — frontend-components가 스타일시트·시각 설계를 명세하지 않아 code-gen이 CSS를 안 만들었다. frontend-components.md에 §5.5 스타일링 명세(전용 `styles.css` 필수, 클래스↔스타일 쌍 목록, 차트 영역 고정 높이, 반응형·접근성·색 비의존, 안전 렌더 유지)를 추가해 공백을 닫음. 교훈: UI 단위는 className을 쓰면 그 스타일 규칙을 반드시 쌍으로 — 스타일시트는 선택이 아니라 필수 산출물.
- 2026-10-26T15:30:00Z — [unit u3-domain-rules] 리뷰 iter1 NOT-READY(Major 2): traceability의 추천 분기 매핑 오류 수정. AC2.1.2(known 경로 '조도 낮으나 구름 많음 → 추천 아님')를 BR2.3(outOfHorizon)에서 BR2.2로 바로잡고, BR2.3의 실제 상류 AC2.1.3(먼 날짜 조도만 추천)을 upstream/coverage에 추가. reverse의 BR1.4·BR1.5는 FR1.1 하위 규칙으로 재분류(OK). BR2.6에 집계값 기준 경계(30% = recommended 쪽) 재확인 메모 추가(Minor).
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
- 2026-10-26T12:09:28Z — [unit u1-astronomy] AC3.2.3("월출/월몰 없으면 '없음'으로 구분 표시")의 UI 표현을 "null이면 항목 생략"으로 바꿀지는 U4(web-ui) Functional Design에서 확정해야 함. 사용자는 Q1 수정답에서 "생략"을 원했으나, U1은 계산 라이브러리라 null 반환까지만 담고 UI 표시는 U4 책임. U4 설계 시 AC3.2.3 갱신 검토.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
