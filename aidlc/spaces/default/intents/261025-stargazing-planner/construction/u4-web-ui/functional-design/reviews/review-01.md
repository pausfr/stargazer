## Review

**Verdict:** NOT-READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-10-27T04:15:49Z
**Iteration:** 1
**Verdict Dictated:** no

u4-web-ui 기능 설계를 상위 계약(C1·C2·C3)과 실제 상위 코드(src/astronomy, src/weather, src/domain-rules)에 대조해 반증을 시도했다. 트레이서빌리티의 AC 커버리지(배정 9개 스토리 25개 AC + NFR1·NFR4)는 빠짐없이 선언되어 있고, 상태 머신(partial=날씨 실패 / error=천문 실패)은 U2 무예외·U1 예외 계약과 정확히 맞으며, recommend(astro, cloud) 시그니처·computeAstronomy 동기 호출·CalendarDate.nightStart/End 사용은 실제 코드와 일치한다. 그러나 상세 그래프 좌y축 "달 밝기 곡선"이 실제 계약에서 구현 불가능한 점이 Critical이며, 캐시 주입 모델 누락 등 설계 공백이 있어 개발자가 아키텍트에게 되묻지 않고 구현하기 어렵다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Critical | functional-spec.md > §4 WF2 step 4 (좌y축 달 밝기 곡선); frontend-components.md > §4 DualAxisChart datasets `{달 밝기, yAxisID:'yMoon'}`; functional-design-questions.md Q2 답변 | 상세 그래프 좌y축을 "달 밝기 **곡선**(시간에 따른 라인)"으로 명세하지만, C1 계약의 달 밝기는 하룻밤당 단일 스칼라 `moonIlluminationPct: number`뿐이다(src/astronomy/types.ts, src/astronomy/astronomy.ts에서 `Illumination(Body.Moon, range.startUtc)` 한 시점으로 1회 계산, 시계열 없음; contract-summary C1도 스칼라 0~100으로 고정). x=시간 축에 얹을 시간별 달 밝기 데이터가 계약에 존재하지 않으므로 "곡선"은 평평한 수평선으로밖에 그릴 수 없다. "기준 라인"이라는 표현이 수평선을 뜻하는지, 보간·별도 시계열을 뜻하는지 모호해 개발자가 추측 없이는 구현할 수 없다. 우y축 구름(cloud.hourlyCloudPct)만 실제 시계열이어서 "두 곡선 겹침" 전제가 비대칭이다. | 좌y축 달 밝기를 실제 계약(단일 스칼라)으로 그릴 구체 표현을 확정하라: (a) 그날 밤 전 구간 일정한 수평 기준선으로 명시하고 범례·축 설명에 "그날 밤 대표 조도"임을 밝히거나, (b) 상위 요구(FR3.2/AC3.1.1)가 요구하는 시간별 달 밝기가 C1에 없음을 상류 모순으로 올려 계약 보강 또는 요구 재정의를 거치게 하라. 어느 쪽이든 frontend-components DualAxisChart의 달 데이터셋 소스를 한 줄로 못박아라. | New |
| R-02 | Major | frontend-components.md > §4 HolidayListView 동작; functional-spec.md > §1·§5 캐시 서술; traceability.json > AC4.1.2 (N/A) | "재방문 시 캐시 자연 활용"(AC4.1.2 N/A 근거)과 NFR4 캐시 전제를 주장하지만, getCloudForecast의 실제 캐시는 호출부가 **단일 DataCache 인스턴스를 만들어 options.cache로 주입·재사용**해야만 히트한다(src/weather/weather.ts: 미주입 시 호출마다 `new DataCache()` → 교차 호출 히트 0; 주석도 "호출부가 재사용"을 명시). 설계는 UI가 공유 DataCache를 소유·주입하는 모델을 어디에도 보이지 않아, 작성된 대로면 캐시 이득이 발생하지 않고 "자연 활용"·NFR4 충족 주장이 계약으로 뒷받침되지 않는다. | frontend-components §3/§4에 UI가 App(또는 모듈 스코프)에서 DataCache 1개를 생성해 모든 getCloudForecast 호출에 `options.cache`로 주입·재사용하는 모델을 명시하라. 그에 맞춰 AC4.1.2 분류(N/A의 "UI는 재방문 시 자연 활용" 근거)와 NFR4 책임을 재검토하라. | New |
| R-03 | Major | functional-spec.md > §4 WF2 step 4~5 (x축=calendar.nightStart/End, 음영=astro.*Twilight); frontend-components.md > §4 DualAxisChart | x축 도메인은 calendar.nightStartKst~nightEndKst(U3)로, 박명·완전한 밤 음영은 astro.*Twilight·fullDark(U1)로 정의하는데, computeAstronomy 호출 시 calendar의 밤 범위(nightStartKst/nightEndKst)를 AstronomyInput에 넘긴다는 명세가 없다. 넘기지 않으면 U1은 BR3.2 기본 범위(18:00~익일 06:00)를 쓰므로(src/astronomy/types.ts·night-range) x축(달력 기준)과 음영·월출몰(천문 기준)이 서로 다른 밤 범위로 산출돼 어긋날 수 있다. | §2/§4에 computeAstronomy 입력으로 calendar.nightStartKst/nightEndKst를 AstronomyInput.nightStartKst/nightEndKst에 전달한다는 조립 규칙을 명시해 x축·음영·월출몰이 동일 밤 범위를 공유하도록 못박아라. | New |
| R-04 | Minor | functional-spec.md > §4 WF2 step 5; frontend-components.md > §4 DualAxisChart annotation 개요 | 박명 음영 box를 `astro.*Twilight`의 start/end로 그린다고만 하고, 이들이 null일 수 있음(TwilightWindow.start/end: `string \| null`, C1 갱신; 서울 하지 무렵 천문박명 미성립 → astronomicalTwilight·fullDark가 null)을 음영 렌더에서 다루지 않는다. fullDark "없음"은 §NightSummary 요약에서만 처리하고 annotation box 생략 규칙은 비어 있다. | 각 박명/완전한 밤 음영 box에 대해 start 또는 end가 null이면 해당 box를 생략한다는 null 처리 규칙을 §4(음영)와 frontend-components DualAxisChart에 추가하라. | New |
| R-05 | Minor | traceability.json > NFR4 (status N/A); user-stories/stories.md > 비기능 커버리지 | 상위 stories.md는 NFR4를 "OK — US4.1(열 때 fetch + 짧은 캐시)"로 기대하는데, 트레이서빌리티는 NFR4를 전부 N/A("캐시는 u2-weather-data 소유")로 분류한다. UI-only 단위라는 점에서 일부 타당하나, 위 Major(캐시 주입)와 함께 보면 UI도 공유 캐시 재사용으로 NFR4에 기여하므로 완전 N/A는 UI 책임을 과소 기록한다. | NFR4를 OK(공유 캐시 재사용·열 때 fetch 책임을 UI 몫으로 명시)로 올리거나, N/A target에 "UI는 U2 캐시를 주입·재사용함"을 추가해 stories.md 기대와 일치시켜라. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| 상위 코드 수동 대조 (src/astronomy, src/weather, src/domain-rules) | computeAstronomy=동기, getCloudForecast=Promise+cache 주입, recommend(astro,cloud)=일치; moonIlluminationPct=단일 스칼라(시계열 아님) | 시그니처 정합은 대체로 OK. 달 밝기 시계열 부재가 Critical 근거. |
| AC 커버리지 열거 (story-map 배정 9개 스토리) | 25개 AC + NFR1·NFR4 모두 upstream_ids·coverage에 선언됨 | 커버리지 누락 없음. 분류 타당성만 상기 Minor 2건. |

### Summary

핵심 아키텍처 결함은 상세 그래프 좌y축 "달 밝기 곡선"을 단일 스칼라 계약으로는 구현할 수 없다는 점(Critical)이며, 캐시 주입 모델 누락으로 NFR4·AC4.1.2의 캐시 활용 주장이 계약으로 뒷받침되지 않는다(Major). 달·구름 밤 범위 정렬과 박명 null 처리까지 보강하면 READY에 이를 수 있다.
