<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations

- 2026-10-27T22:42Z — [u4 재작업] C1 `moonHourly` 체감 밝기 정규화 기준을 "그날 밤 실제 천문 남중 고도=100%"로 고정(§2.1). 위상 스케일(illuminated fraction)은 밤 전 샘플에 공통이라 남중 정규화에서 상쇄되므로, 상대 밝기 곡선은 위상값과 독립적·결정적이 된다(월출만/월몰만 있는 밤에도 스케일 안정). 남중 탐색은 SearchHourAngle(hour angle 0)로 밤 중앙에 가장 가까운 상위 자오선 통과를 골라 밤 범위 밖이어도 참조. 소광은 Kasten-Young airmass × k=0.23 mag/airmass 투과율, 입사각은 sin(고도). 결함 6(월출만 있고 월몰 null 비대칭)은 월몰을 월출 이후부터 탐색하도록 바꿔 제거. 기존 astronomy.test.ts의 "독립 null" 테스트는 구(舊) 전방탐색 전제를 담고 있어 대칭 탐색 기준으로 갱신.
- 2026-10-27T08:50Z — [u4] 월출·월몰 "없음" 표시 결정 복구·확정. u1 functional-design-questions.md Q1 답에 "null이면 UI에서 '없음' 문구 없이 생략"이 있었으나 rules.md·entities.md로 내려오며 "표시 방식은 U4 책임"으로만 중립화되고 u4엔 전달되지 않음(단계 건너가며 증발). 사용자·감독이 최종으로 그 "생략"을 의도적으로 뒤집어 "null이면 '없음'(월출/월몰/완전한 밤 없음) 명시 표시"로 확정(달 없는 밤은 관측 최고 조건이라 명시가 유용·생략은 데이터 오류와 혼동). 네 곳 일관 갱신: ①u1 questions.md Q1 답·rules.md BR3.1 violation_behaviour ②C1 계약 주석 ③stories.md AC3.2.3(이미 "없음") ④u4 설계·code-gen 계획 Step 13. summaryView.toNightSummaryView가 이를 구현.
- 2026-10-26: BR1.3 불변식 확정 — FORECAST_HORIZON_DAYS=14 ≤ Open-Meteo forecast 범위 16일. types.ts 단일 상수로 분리하고 주석에 근거 기록. 컷오프(14일) 이내는 unknown, 초과는 outOfHorizon으로 두 상태가 겹치지 않음. 컷오프 날짜 비교는 KST epoch-day 인덱스 차로 결정적 수행(시각 세부 비의존).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-27T22:48Z — [u4 2차 재작업] 기능 변경에 따른 테스트 정합 조정(기능 축소 아님): ① astronomy.test.ts "월출/월몰 독립 null" 테스트가 구(舊) 전방탐색 전제를 담아 Fix B(대칭 탐색) 후 실패 → 라이브러리로 동일한 대칭 탐색 순서를 재현해 기대를 재계산(월몰은 월출 이후부터 탐색). ② chart.test.ts의 buildMoonBaseline 테스트를 buildMoonCurve(시계열)·formatKstHourMinute(KST HH:MM)·음영 alpha 차등/라벨 테스트로 교체. ③ fixtures.makeAstro에 결정적 moonHourly 추가, domain-rules.test.ts astroWith에 moonHourly:[] 추가(C1 계약 확장 정합, tsc 통과용). ④ detailView.dom·summaryView 테스트를 "값은 '없음'만, 라벨 중복 없음"으로 갱신. 커버리지 플로어·테스트 설정은 낮추지 않음(u1 라인 92.1%).
- 2026-10-27T13:00Z — [u4] 체크포인트 반려(맨 텍스트 UI) 재작업: 스타일시트 전면 누락 보완. 원인은 className은 있는데 대응 CSS 없음 + 차트 영역 부모 높이 미지정(Chart.js canvas 0 높이). styles.css 신설(뷰가 실제 쓰는 클래스에 1:1, `.chart-wrap` 320px 고정 높이), main.ts에서 import해 번들 포함. 교훈: UI 단위는 className과 그 스타일 규칙이 한 쌍으로 완결돼야 하고(스타일시트는 필수 산출물), 차트/canvas 컨테이너는 명시 높이가 없으면 안 보인다. 리뷰·단위 테스트가 로직·빌드만 보고 실제 렌더를 수동 스모크로 미뤄 못 잡은 것도 교훈 — UI는 수동 스모크 체크리스트(카드 형태·추천 강조·차트 가시성)가 반드시 돌아야 한다.
- 2026-10-26T16:30Z — [u3] 사용자 지적 반영: 공휴일 내장 테이블이 과거 연도(2024·2025)를 담고 있었으나, 앱은 "현재부터 3개월+ 앞"의 연휴만 보여주므로(FR1.1) 과거 연도는 영원히 후보에 들 수 없는 사표(dead weight)였다. 테이블을 현재 연도부터 앞으로만(2026~2028)로 재정렬하고 커버 범위 상수를 FROM_YEAR=2026·TO_YEAR=2028로 조정. 2028 추석(10/3)과 개천절 겹침은 추석 연휴로 통합. 테스트 31개 유지, 커버리지 97.18%.
- 2026-10-26T16:18Z — [u3] 리뷰 iter1 READY(Major 1): 공휴일 테이블 토·일 겹침 대체공휴일 규칙 불일치 수정. 2026 추석(9/26 토) 대체공휴일 9/28(월) 누락(광복절 8/17·개천절 10/5는 수록)을 추가 + 전용 테스트. 2024(주중)·2025(10/8 기수록)·2027(2/9 기수록) 정합 확인. recommend에 C2 enum 밖 status 명시 deferred 분기 추가(Minor #1). 테스트 29→31, 커버리지 97.38%.
- 2026-10-26T01:14Z — 계획 plan_profile의 테스트 가능 레이어 중 "API/endpoint"·"Frontend behavior"는 순수 규칙 라이브러리 U3에 해당 없어 생략(계획 본문 §방법론 적용에 명시된 매핑대로). index.ts는 재노출 배럴이라 실행 로직이 없어 스코프 커버리지에서 0%로 표기되나(U1·U2 index와 동일 성격), 단위 전체 라인 커버리지 97.35%로 핵심 모듈 80% 플로어를 충족.

- 2026-10-26: 리뷰 Minor #1 수정 — outOfHorizon 결과 캐시 TTL을 `min(긴 TTL, 다음 KST 자정까지)`로 제한. outOfHorizon 판정이 "오늘 KST"에 의존(BR1.1)하므로 자정을 넘기면 같은 날짜가 지평 안으로 들어와 stale outOfHorizon을 반환하던 엣지를 제거(weather.ts msUntilNextKstMidnight + 전용 테스트 1개). 테스트 31→32, 커버리지 93.64%. Minor #2(계획-산출 테스트 파일 드리프트)는 code-summary 편차 노트에 반영, Minor #3(index TTL 상수 비노출)은 의도된 공개 표면으로 현행 유지.

- 2026-10-26: 계획 기록 명령 `npx vitest run src/weather --coverage` 는 루트 v8 커버리지가 리포지토리 전체(.kiro 툴링 포함)를 집계해 핵심 모듈 플로어가 희석됨. 유닛 플로어 측정은 `--coverage.include='src/weather/**'` 로 경로를 한정해 실행함(vitest.config.ts 주석의 "단위 실행 명령이 경로를 한정" 의도와 일치). 기능·테스트 범위는 동일, 측정 방식만 명시.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-10-27T13:02Z — [u4] 검증 실패 원인은 코드가 아니라 의존성 regression: 스타일 재작업의 npm install이 vitest 2.1.9→4, @vitest/coverage-v8→5로 올려 커버리지 수집이 `coverageFilesDirectory is required`로 깨짐. package.json을 정합 고정 세트(vitest 2.1.9/coverage 2.1.9/vite 5.4.11/chart.js 4.4.7/annotation 3.1.0/happy-dom 15.11.7/eslint 9.17.0 핀)로 복원·재설치해 해결. 커버리지를 끄거나 명령을 바꾸는 우회 없이 근본 원인(버전 불일치)을 고침. 교훈: 새 의존성 추가는 기존 고정 버전을 범위로 풀거나 메이저를 올리면 안 된다(정확 고정 유지).