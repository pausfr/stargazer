## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-27T13:50:22Z
**Iteration:** 1
**Verdict Dictated:** no

5개 재작업 수정(A~E)을 상류 functional-spec §2.1을 권위로 삼아 코드와 대조 검증했고, 기록된 검증 명령을 실제 실행했다. 결론적으로 다섯 수정 모두 계획과 §2.1에 맞게 올바르고 완전하게 구현되었으며, 핵심 계산 모듈 커버리지 플로어는 낮추지 않았다. 반증을 시도했으나 READY를 뒤집을 근거를 찾지 못했다.

**수정별 검증 요지**

- **Fix A** — `src/astronomy/types.ts`에 `MoonHourlySample { hourKst; altitudeDeg; relativeBrightnessPct }`와 `AstronomyResult.moonHourly`가 추가되었고 `moonIlluminationPct`(위상 스칼라)는 유지된다. `astronomy.ts`의 `computeMoonHourly`는 밤 범위를 30분 간격 샘플링하고 체감 밝기 = `sin(고도)` × `10^(-0.4·k·airmass)`(Kasten-Young airmass, k=0.23)로 계산한다. `moonTransitAltitudeDeg`가 밤 범위 밖이어도 실제 천문 남중 고도를 기준으로 100% 정규화하고, 고도 ≤ 0은 0%. 위상 스케일이 전 샘플 공통이라 정규화에서 상쇄되어 결정적이다. §2.1 일치.
- **Fix B** — `computeMoonRiseSet`가 월출을 먼저 찾고 월몰을 그 이후(`setSearchFrom = rise ? rise.date : range.startUtc`)부터 탐색해 "월출만 있고 월몰 null"의 인공 비대칭을 제거한다. 둘 다 null 가능성은 `inRange` 필터로 보존되며, 이는 §2.1 "둘 다 null 가능성은 유지"와 정합한다.
- **Fix C** — `moonHourly.test.ts`(8 tests)가 남중≈100%·고도≤0=0%·상승 단조증가·하강 단조감소·저고도 ≤20%·월출→월몰 대칭을 고정하고, `astronomy.test.ts`의 독립 null 테스트가 Fix B 탐색 순서에 맞게 갱신되었다. u1 스코프 커버리지 라인 92.1%(astronomy.ts 95%)로 80% 플로어를 충족한다(아래 Validation 참조).
- **Fix D** — `chart.ts`의 좌y축은 `buildMoonCurve`(moonHourly 시계열 꺾은선, 수평 기준선 아님)이고, x축은 linear epoch를 쓰되 `ticks.callback`이 `formatKstHourMinute`로 KST "HH:MM"만 렌더(원본 epoch 비노출)한다. 박명 음영은 `SHADE_ALPHA` 시민 0.1 < 항해 0.2 < 천문 0.32 < 완전한 밤 0.48로 차등, 각 box `label.display:true`에 구간 라벨, 경계 null이면 box 생략. §2.1·§4 일치.
- **Fix E** — `summaryView.ts`의 None 상수가 값 전용 `'없음'`이고 `detailView.renderSummary`가 라벨 span + 값 span을 분리 렌더하므로 "월몰 없음"으로 읽힌다("월몰 월몰 없음" 중복 제거). `renderLegend`의 낡은 "수평 기준선" 문구가 "달 체감 밝기: 시간별 곡선(남중=100%)"으로 갱신됐다. `detailView.dom.test.ts`가 DOM 수준에서 라벨/값 분리와 "없음"을 확정한다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | src/web-ui/listView.ts > error 카드 분기 (`if (night.state === 'error')`) | error 상태 카드는 "천문 계산 실패 — 눌러서 다시 시도"와 함께 상세 재시도로 이동하는 경로지만, `renderCard`는 재시도 아이콘/라벨을 색 외 보조 형태로 특별히 강조하지 않는다. 추천 강조(별+라벨)와 달리 error 상태의 시각적 구분은 텍스트 1줄에 의존한다. 기능 결함은 아니나 수동 스모크에서 다크모드 대비·접근성 확인이 필요하다. | 수동 스모크 체크리스트에 error 카드의 색 비의존 식별성(아이콘/라벨/대비)을 명시적으로 포함한다. | Resolved (reviewer) |
| R-02 | Minor | src/web-ui/chart.ts > `buildAnnotations` / `renderDetail`의 chart try/catch | 테스트 환경 외 실제 Chart.js 그리기·annotation 음영은 단위 테스트에서 제외되고(team.md 방침과 일관) `detailView`의 `try/catch`가 canvas 컨텍스트 부재를 조용히 삼킨다. 정상 범위이나, 실제 브라우저에서 렌더 실패가 무음으로 묻힐 여지가 있다. | 수동 스모크에서 실제 이중축·박명 음영·단일 인스턴스 갱신(PD4)을 브라우저로 1회 확인하고, 필요 시 렌더 실패에 대한 사용자 안내(현재는 요약만 유지) 추가를 검토한다. | Unresolved |
| R-03 | Minor | src/web-ui/__tests__/detailView.dom.test.ts > `vi.mock('../chart.js', ...)` | Fix D에서 제거된 구(舊) export `buildMoonBaseline`을 모의 팩토리가 여전히 `buildMoonBaseline: vi.fn()`으로 노출한다. 실제 모듈엔 없는 이름이라 테스트는 통과하지만, "수평 기준선 폐기"를 표방한 재작업에 남은 잔재다. | 모의 팩토리에서 `buildMoonBaseline` 항목을 제거하고 현재 export(`buildMoonCurve` 등)에 맞춘다. | New |
| R-04 | Minor | src/astronomy/__tests__/astronomy.test.ts > "월출/월몰은 서로 독립적으로 null일 수 있다" | 이 테스트가 구현과 동일한 탐색식(`setSearchFrom = rise ? rise.date : startUtc`)을 재현해 기대값을 만든다(동어반복). 대칭성 자체는 고정하지만 구현과 독립된 오라클은 아니다. moonHourly.test.ts의 대칭 테스트가 보완하므로 영향은 제한적. | 고정된 실제 날짜의 알려진 월출·월몰 시각을 상수 오라클로 두어 구현식 재현 없이 검증하도록 보강(선택). | New |

> R-01 Reviewer note: unit-test-instructions.md 수동 스모크 체크리스트 마지막 항목에 "error 카드가 색 외 아이콘/텍스트로 구분된다(리뷰 Minor 보완)"가 명시적으로 포함됨.

> R-02 Reviewer note: 스모크 체크리스트에 "차트가 보인다: 이중축·박명 음영·범례"는 추가됐으나, R-02가 명시한 단일 인스턴스 갱신(PD4) 브라우저 확인 항목은 체크리스트에 명시적으로 들어있지 않다. 기능 결함 아님(NightChart는 PD4대로 update()만 호출).

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npx tsc --noEmit && npx vitest run --coverage` | PASS (exit 0): 17 test files, 147/147 tests passed, tsc 오류 없음 | 전체 스위트 green. 루트 집계 라인 0.68%는 .kiro 툴링 포함 집계라 핵심 모듈 플로어와 무관(project.md 학습대로 경로 한정 측정으로 판단). |
| `npx vitest run src/astronomy --coverage --coverage.include='src/astronomy/**'` | PASS (exit 0): 2 files, 30/30 tests, Lines 92.1% (astronomy.ts 95%) | u1 핵심 계산 모듈 80% 라인 커버리지 플로어 충족. vitest.config.ts에 임계값 설정 없음(플로어는 팀 정책·경로 한정 측정) → 플로어/임계값 약화 없음 확인. |

### Summary

5개 수정 모두 §2.1·계획과 정합하게 구현됐고, tsc·전체 스위트·u1 스코프 커버리지(92.1% ≥ 80%) 모두 통과한다. 남은 지적은 모두 테스트 위생 수준의 Minor(구 export 잔재 모의, 동어반복 대칭 테스트)이며 열린 Critical/Major가 없어 READY다.
