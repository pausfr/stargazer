**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1
**Verdict Dictated:** no
**Date:** 2026-10-27T12:21:43Z

### Review

u4-web-ui(표시 전용 UI 번들 진입점)의 Code Generation 산출물을 적대적으로 검증했다. 테스트·타입검사·번들 빌드가 모두 통과하고, 방금 닫힌 "없음" 명시 표시 결정(AC3.2.3)이 코드에 실제로 구현되어 있으며, 상위 계약(C1/C2/C3) 통합·보안 요건·추적성·핵심 모듈 커버리지 플로어 비침해가 모두 확인된다. 결함을 깨뜨리려 시도했으나 READY를 뒤집을 Critical/Major 근거를 찾지 못했다. 경미한 관찰만 아래에 남긴다.

### 검증한 핵심 사항 (근거)

- **테스트 실행(지시된 명령 그대로).** `npx vitest run src/web-ui` → **Test Files 9 passed (9) / Tests 46 passed (46)**, Duration 1.36s. code-summary.md의 "46 tests passed / 0 failed" 주장과 일치한다. 계획이 말한 "약 14~20개"보다 많으나(순수 함수 모듈을 분해 신설한 경미 편차와 일관), 실제 수가 더 많은 것은 결함이 아니다.
- **타입검사·빌드.** `npx tsc --noEmit` → 종료코드 0(오류 없음). `npx vite build` → "✓ 38 modules transformed", `dist-web/` 정적 번들 산출, 종료코드 0.
- **테스트의 실질성(비공허).** 단정이 행위를 검증한다: `assembler.test.ts`는 astro throw 경로에서 `recommend` 미호출(`expect(recommend).not.toHaveBeenCalled()`)·`state==='error'`·`verdict===null`을, computeAstronomy 호출 인자의 `nightStartKst/nightEndKst/lat/lon/dateKstId` 전달을, 같은 `cache`·`nowMs` 인스턴스 재주입(`toBe(sharedCtx.cache)`)을 검증한다. `summaryView.test.ts`·`detailView.dom.test.ts`는 null→"월출 없음/월몰 없음/완전한 밤 없음" 텍스트와 재시도 상태 전이(error→재조립 후 `detail-error` 제거·`detail-content` 등장)를 검증한다. assert-true류 공허 테스트는 없다.
- **보안(SD2/SD3·NFR6.x).** `src/web-ui/*.ts`에 `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`eval` 사용 없음(검색 결과는 주석의 "innerHTML 금지" 문구뿐). 하드코딩 비밀값 없음(api key/secret/token/password 검색 무결과; 외부 호출은 U2에 위임). 내부 사유 비노출: C2 `reason`·`AstronomyComputationError.code`는 `state.ts` 주석에만 등장하고 UI 문자열로 읽히지 않는다. assembler는 throw를 격리만 하고 `code`를 읽지 않는다(SD3/NFR6.3 충족).
- **통합 정확성(C1/C2/C3·§2.1).** `assembler.ts`는 즉시 단계에서 `computeAstronomy({dateKstId,lat,lon,nightStartKst,nightEndKst})`로 밤 범위를 전달하고, 이후 `await getCloudForecast({dateKstId,lat,lon},{nowMs,cache})`로 공유 캐시·기준시각을 주입하며, 구름 수신 **이후** `recommend(astro,cloud)`를 호출한다(즉시 동기 단계가 아님). 달 밝기는 `buildMoonBaseline`이 밤 양끝 2점에 동일 y를 찍는 **수평 기준선**으로 그려지며 시계열 곡선이 아니다(§2.1). 구름 데이터셋/우축은 `status==='known'`일 때만 포함된다.
- **"없음" 결정(AC3.2.3).** `summaryView.toNightSummaryView`가 `moonrise/moonset/fullDark*` null을 `월출 없음/월몰 없음/완전한 밤 없음` 상수로 변환하고, `detailView.renderSummary`가 그 값을 각 행에 `textContent`로 렌더한다(완전한 밤 미성립 시 `fullDarkStartText`="완전한 밤 없음" 표시). 생략이 아니라 명시 표시가 코드로 확인된다.
- **추적성·매니페스트.** `traceability.json`의 모든 `OK` target 파일(listView/assembler/recommendationView/detailView/chart/summaryView/state/app, index.html, vite.config.ts)이 실재하며 해당 ID를 구현한다. `source-manifest.json`의 `writes` 경로 집합이 작업 트리의 신규/수정 파일 집합과 일치한다(불필요·무관 경로 없음).
- **핵심 모듈 커버리지 플로어 비침해.** `vitest.config.ts`는 u4 변경 집합(git diff)에 없다 — 즉 u4가 u1/u2/u3 커버리지 설정을 건드리지 않았다. 플로어는 실행 시 `--coverage.include='src/<unit>/**'` 경로 한정으로 측정하도록 두었고, team.md Q4대로 u4(UI)는 플로어 비대상이다. 전체 스위트 `npx vitest run`은 미실행이나(단위 범위 검증으로 충분), code-summary의 "131 passed" 주장은 이 리뷰 범위 밖 주장으로 남겨둔다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | src/web-ui/listView.ts > error 카드 분기 (`if (night.state === 'error')`) | error 상태 카드는 "천문 계산 실패 — 눌러서 다시 시도"와 함께 상세 재시도로 이동하는 경로지만, `renderCard`는 재시도 아이콘/라벨을 색 외 보조 형태로 특별히 강조하지 않는다. 추천 강조(별+라벨)와 달리 error 상태의 시각적 구분은 텍스트 1줄에 의존한다. 기능 결함은 아니나 수동 스모크에서 다크모드 대비·접근성 확인이 필요하다. | 수동 스모크 체크리스트에 error 카드의 색 비의존 식별성(아이콘/라벨/대비)을 명시적으로 포함한다. | New |
| R-02 | Minor | src/web-ui/chart.ts > `buildAnnotations` / `renderDetail`의 chart try/catch | 테스트 환경 외 실제 Chart.js 그리기·annotation 음영은 단위 테스트에서 제외되고(team.md 방침과 일관) `detailView`의 `try/catch`가 canvas 컨텍스트 부재를 조용히 삼킨다. 정상 범위이나, 실제 브라우저에서 렌더 실패가 무음으로 묻힐 여지가 있다. | 수동 스모크에서 실제 이중축·박명 음영·단일 인스턴스 갱신(PD4)을 브라우저로 1회 확인하고, 필요 시 렌더 실패에 대한 사용자 안내(현재는 요약만 유지) 추가를 검토한다. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| npx vitest run src/web-ui | PASS: 9 files, 46 tests, 0 failed | 단위 테스트 전부 통과. 공허 단정 없음(행위 검증 확인). |
| npx tsc --noEmit | PASS (exit 0) | 타입 오류 없음. 상위 계약 타입과 통합 정합. |
| npx vite build | PASS (exit 0, dist-web 산출) | 정적 번들 산출 성공(NFR7). |
| git diff (변경 파일 집합) | vitest.config.ts 미포함 | u4가 핵심 모듈 커버리지 플로어를 낮추지 않음. source-manifest와 실제 변경 집합 일치. |

### Summary

적대적 검증에서 Critical/Major 결함을 찾지 못했다: 테스트·tsc·vite build 통과, "없음" 명시 표시(AC3.2.3)·C1/C2/C3 통합·보안·추적성·커버리지 플로어 비침해 모두 코드로 확인된다. 개발자가 이 산출물로 더 이상 설계 질문 없이 구현을 이어갈 수 있으므로 READY로 판단하며, 남은 2건은 수동 스모크로 보완할 경미 관찰이다.
