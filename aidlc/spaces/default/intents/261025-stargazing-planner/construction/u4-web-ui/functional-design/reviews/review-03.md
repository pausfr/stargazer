**Reviewer:** aidlc-architecture-reviewer-agent

### Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-27T12:38:08Z
**Iteration:** 1
**Verdict Dictated:** no

새 §5.5 "스타일링 명세"가 체크포인트 반려의 근본 원인(className만 붙고 대응 CSS가 없어 맨 텍스트로 렌더됨)을 설계 차원에서 실제로 닫는지, 그리고 §2 계층·§4 props·functional-spec §2.1과 모순이 없는지 적대적으로 확인했다. 결론적으로 설계는 구현 가능한 수준으로 공백을 메웠다.

### 공백 폐쇄 확인(적대적 검증 근거)

- **전용 스타일시트 필수화**: §5.5가 `src/web-ui/styles.css`를 **필수 산출물**로, "스타일시트 없는 산출물은 미완성"으로 못박는다. index.html(워크스페이스 루트)을 직접 대조한 결과, 인라인 `<style>`은 CSS 변수(`--bg`, `--surface`, `--surface-2`, `--text`, `--text-dim`, `--border`, `--accent`=#ffd54a, `--accent-text`, `--danger`)와 `html/body/#app`(max-width 720px) 기본만 가지며 컴포넌트 스타일이 전혀 없다 — §5.5의 상황 서술과 정확히 일치하고, §5.5가 참조하는 토큰·마운트 지점(`/src/main.ts`)도 실재한다.
- **className↔규칙 1:1 짝**: §2 계층과 §4 props가 부여하는 className을 §5.5의 짝 목록과 대조했다. `.card`/`.card.recommended`(NightCard), `.badge-recommend`(RecommendBadge), `.moon-illum`·`.cloud-summary`(MoonPhaseIcon·CloudSummary), `.skeleton`(List/DetailLoadingSkeleton), `.empty-state`(EmptyState), `.detail`(NightDetailView), `.chart-container`(DualAxisChart), `.summary`/`.summary-row`(NightSummary), `.legend`(ChartLegend), `.notice`/`.notice-far`(unknown·outOfHorizon 안내), `.error`/`.btn-retry`(ErrorRetry), `.btn-back`(뒤로가기) — 컴포넌트가 함의하는 주요 className이 모두 규칙을 가진다. 규칙 없는 className은 발견하지 못했다.
- **chart-container 고정 높이**(차트가 안 보이던 바로 그 원인): `.chart-container`에 고정 높이(예: 320px)와 100% 폭을 **명시**하고, Chart.js canvas가 부모 크기 의존이라 높이 미지정 시 0 높이로 안 보인다는 이유까지 적혀 있다. 핵심 결함을 정면으로 짚었다.
- **색 비의존 강조 유지**: `.card.recommended`와 §6 체크리스트가 추천 강조를 테두리 색 + 별 아이콘(형태) + "추천" 라벨(텍스트) 3중으로 규정(NFR1·AC2.1.4). 색 전용이 아니다.
- **안전 렌더 유지**: 스타일은 class 토글로만 적용, 사용자 노출 문자열은 계속 `textContent` 바인딩, innerHTML 금지를 명시 — 스타일 추가가 안전 렌더 규칙을 바꾸지 않음을 분명히 했다.
- **설계 수준 유지**: 완성 CSS를 덤프하지 않고 "무엇을/왜" 필요한지를 서술(토큰·높이·반응형·접근성·색 비의존). code-generation이 실제 CSS를 작성하도록 요구하는 구조로, 15줄 초과 구현 코드 덤프가 없다.
- **모바일 우선·데스크톱 비파괴(NFR2)**: 모바일 세로 1열 기본, `#app` max-width(720px) 안에서 미디어쿼리로 내부 정렬만 조정, 레이아웃 붕괴 없음을 명시.
- **functional-spec §2.1 정합**: §5.5는 달 밝기를 수평 기준선으로 보는 §2.1과 충돌하는 어떤 스타일 주장도 하지 않는다. `.summary`/`.summary-row`가 "없음" 값도 동일 스타일로 표시(AC3.2.3)한다고 적어 "없음" 표시 결정과도 일치한다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Critical | functional-spec.md > §4 WF2 step 4 (좌y축 달 밝기 곡선); frontend-components.md > §4 DualAxisChart datasets `{달 밝기, yAxisID:'yMoon'}`; functional-design-questions.md Q2 답변 | 상세 그래프 좌y축을 "달 밝기 **곡선**(시간에 따른 라인)"으로 명세하지만, C1 계약의 달 밝기는 하룻밤당 단일 스칼라 `moonIlluminationPct: number`뿐이다(src/astronomy/types.ts, src/astronomy/astronomy.ts에서 `Illumination(Body.Moon, range.startUtc)` 한 시점으로 1회 계산, 시계열 없음; contract-summary C1도 스칼라 0~100으로 고정). x=시간 축에 얹을 시간별 달 밝기 데이터가 계약에 존재하지 않으므로 "곡선"은 평평한 수평선으로밖에 그릴 수 없다. "기준 라인"이라는 표현이 수평선을 뜻하는지, 보간·별도 시계열을 뜻하는지 모호해 개발자가 추측 없이는 구현할 수 없다. 우y축 구름(cloud.hourlyCloudPct)만 실제 시계열이어서 "두 곡선 겹침" 전제가 비대칭이다. | 좌y축 달 밝기를 실제 계약(단일 스칼라)으로 그릴 구체 표현을 확정하라: (a) 그날 밤 전 구간 일정한 수평 기준선으로 명시하고 범례·축 설명에 "그날 밤 대표 조도"임을 밝히거나, (b) 상위 요구(FR3.2/AC3.1.1)가 요구하는 시간별 달 밝기가 C1에 없음을 상류 모순으로 올려 계약 보강 또는 요구 재정의를 거치게 하라. 어느 쪽이든 frontend-components DualAxisChart의 달 데이터셋 소스를 한 줄로 못박아라. | Resolved (reviewer) |
| R-02 | Major | frontend-components.md > §4 HolidayListView 동작; functional-spec.md > §1·§5 캐시 서술; traceability.json > AC4.1.2 (N/A) | "재방문 시 캐시 자연 활용"(AC4.1.2 N/A 근거)과 NFR4 캐시 전제를 주장하지만, getCloudForecast의 실제 캐시는 호출부가 **단일 DataCache 인스턴스를 만들어 options.cache로 주입·재사용**해야만 히트한다(src/weather/weather.ts: 미주입 시 호출마다 `new DataCache()` → 교차 호출 히트 0; 주석도 "호출부가 재사용"을 명시). 설계는 UI가 공유 DataCache를 소유·주입하는 모델을 어디에도 보이지 않아, 작성된 대로면 캐시 이득이 발생하지 않고 "자연 활용"·NFR4 충족 주장이 계약으로 뒷받침되지 않는다. | frontend-components §3/§4에 UI가 App(또는 모듈 스코프)에서 DataCache 1개를 생성해 모든 getCloudForecast 호출에 `options.cache`로 주입·재사용하는 모델을 명시하라. 그에 맞춰 AC4.1.2 분류(N/A의 "UI는 재방문 시 자연 활용" 근거)와 NFR4 책임을 재검토하라. | Resolved (reviewer) |
| R-03 | Major | functional-spec.md > §4 WF2 step 4~5 (x축=calendar.nightStart/End, 음영=astro.*Twilight); frontend-components.md > §4 DualAxisChart | x축 도메인은 calendar.nightStartKst~nightEndKst(U3)로, 박명·완전한 밤 음영은 astro.*Twilight·fullDark(U1)로 정의하는데, computeAstronomy 호출 시 calendar의 밤 범위(nightStartKst/nightEndKst)를 AstronomyInput에 넘긴다는 명세가 없다. 넘기지 않으면 U1은 BR3.2 기본 범위(18:00~익일 06:00)를 쓰므로(src/astronomy/types.ts·night-range) x축(달력 기준)과 음영·월출몰(천문 기준)이 서로 다른 밤 범위로 산출돼 어긋날 수 있다. | §2/§4에 computeAstronomy 입력으로 calendar.nightStartKst/nightEndKst를 AstronomyInput.nightStartKst/nightEndKst에 전달한다는 조립 규칙을 명시해 x축·음영·월출몰이 동일 밤 범위를 공유하도록 못박아라. | Resolved (reviewer) |
| R-04 | Minor | functional-spec.md > §4 WF2 step 5; frontend-components.md > §4 DualAxisChart annotation 개요 | 박명 음영 box를 `astro.*Twilight`의 start/end로 그린다고만 하고, 이들이 null일 수 있음(TwilightWindow.start/end: `string \| null`, C1 갱신; 서울 하지 무렵 천문박명 미성립 → astronomicalTwilight·fullDark가 null)을 음영 렌더에서 다루지 않는다. fullDark "없음"은 §NightSummary 요약에서만 처리하고 annotation box 생략 규칙은 비어 있다. | 각 박명/완전한 밤 음영 box에 대해 start 또는 end가 null이면 해당 box를 생략한다는 null 처리 규칙을 §4(음영)와 frontend-components DualAxisChart에 추가하라. | Resolved (reviewer) |
| R-05 | Minor | traceability.json > NFR4 (status N/A); user-stories/stories.md > 비기능 커버리지 | 상위 stories.md는 NFR4를 "OK — US4.1(열 때 fetch + 짧은 캐시)"로 기대하는데, 트레이서빌리티는 NFR4를 전부 N/A("캐시는 u2-weather-data 소유")로 분류한다. UI-only 단위라는 점에서 일부 타당하나, 위 Major(캐시 주입)와 함께 보면 UI도 공유 캐시 재사용으로 NFR4에 기여하므로 완전 N/A는 UI 책임을 과소 기록한다. | NFR4를 OK(공유 캐시 재사용·열 때 fetch 책임을 UI 몫으로 명시)로 올리거나, N/A target에 "UI는 U2 캐시를 주입·재사용함"을 추가해 stories.md 기대와 일치시켜라. | Resolved (reviewer) |
| R-06 | Minor | frontend-components.md > §5.5 "안전 렌더 유지(NFR6.2)" 항목 | 안전 렌더(innerHTML 금지/textContent) 요구에 `NFR6.2`를 인용하나, 상위 requirements.md의 NFR6은 하위 번호(.2)가 없는 단일 보안 요구(비밀값 하드코딩 금지)이고 `.2` 접미 ID는 상류에서 해소되지 않는다. 안전 렌더는 설계 자체로 명확해 구현에 영향은 없으나 추적 참조가 틀렸다 | 안전 렌더 근거를 실재하는 상위 ID로 교정한다(보안이면 `NFR6`, 또는 해당 표시 요구가 있는 FR/AC). 없으면 "설계 결정"으로 중립 표기하고 가짜 하위 ID 인용을 제거한다 | New |

### Summary

새 §5.5는 "className만 있고 CSS 없음" 공백을 전용 styles.css 필수화 + className↔규칙 짝 + chart-container 고정 높이로 설계 차원에서 닫았고, 색 비의존 강조·안전 렌더·모바일 우선을 모두 보존하며 상위 계약·§2.1과 모순이 없다. 유일한 지적은 `NFR6.2`라는 비실재 하위 ID 인용(Minor, 비차단)이다.
