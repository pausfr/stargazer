**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1
**Verdict Dictated:** no
**Date:** 2026-10-27T13:17:25Z

### Review

리비전(수평 기준선 → 시간별 체감 밝기 곡선, C1 `moonHourly[]` 확장, x축 KST HH:MM 포맷, 박명 음영 농도 차등+내부 라벨, 요약 월출·월몰 null="없음" 값 단독)을 적대적으로 검증했다. 다섯 가지 변경이 functional-spec.md·frontend-components.md·traceability.json·상위 C1 계약과 모순 없이 정합하며 설계 수준(무엇을/왜, 구현 코드 덤프 아님)을 유지한다. C1 확장은 순수 additive(기존 `moonIlluminationPct` 유지)이고 제안된 산출식은 물리적으로 타당하며 C5 결정론 계약과 일치한다. Critical 없음, 차단 Major 없음 → READY. 아래는 U1 code-generation에서 못박을 경미/권고 사항이다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Critical | functional-spec.md > §4 WF2 step 4 (좌y축 달 밝기 곡선); frontend-components.md > §4 DualAxisChart datasets `{달 밝기, yAxisID:'yMoon'}`; functional-design-questions.md Q2 답변 | 상세 그래프 좌y축을 "달 밝기 **곡선**(시간에 따른 라인)"으로 명세하지만, C1 계약의 달 밝기는 하룻밤당 단일 스칼라 `moonIlluminationPct: number`뿐이다(src/astronomy/types.ts, src/astronomy/astronomy.ts에서 `Illumination(Body.Moon, range.startUtc)` 한 시점으로 1회 계산, 시계열 없음; contract-summary C1도 스칼라 0~100으로 고정). x=시간 축에 얹을 시간별 달 밝기 데이터가 계약에 존재하지 않으므로 "곡선"은 평평한 수평선으로밖에 그릴 수 없다. "기준 라인"이라는 표현이 수평선을 뜻하는지, 보간·별도 시계열을 뜻하는지 모호해 개발자가 추측 없이는 구현할 수 없다. 우y축 구름(cloud.hourlyCloudPct)만 실제 시계열이어서 "두 곡선 겹침" 전제가 비대칭이다. | 좌y축 달 밝기를 실제 계약(단일 스칼라)으로 그릴 구체 표현을 확정하라: (a) 그날 밤 전 구간 일정한 수평 기준선으로 명시하고 범례·축 설명에 "그날 밤 대표 조도"임을 밝히거나, (b) 상위 요구(FR3.2/AC3.1.1)가 요구하는 시간별 달 밝기가 C1에 없음을 상류 모순으로 올려 계약 보강 또는 요구 재정의를 거치게 하라. 어느 쪽이든 frontend-components DualAxisChart의 달 데이터셋 소스를 한 줄로 못박아라. | Resolved (reviewer) |
| R-02 | Major | frontend-components.md > §4 HolidayListView 동작; functional-spec.md > §1·§5 캐시 서술; traceability.json > AC4.1.2 (N/A) | "재방문 시 캐시 자연 활용"(AC4.1.2 N/A 근거)과 NFR4 캐시 전제를 주장하지만, getCloudForecast의 실제 캐시는 호출부가 **단일 DataCache 인스턴스를 만들어 options.cache로 주입·재사용**해야만 히트한다(src/weather/weather.ts: 미주입 시 호출마다 `new DataCache()` → 교차 호출 히트 0; 주석도 "호출부가 재사용"을 명시). 설계는 UI가 공유 DataCache를 소유·주입하는 모델을 어디에도 보이지 않아, 작성된 대로면 캐시 이득이 발생하지 않고 "자연 활용"·NFR4 충족 주장이 계약으로 뒷받침되지 않는다. | frontend-components §3/§4에 UI가 App(또는 모듈 스코프)에서 DataCache 1개를 생성해 모든 getCloudForecast 호출에 `options.cache`로 주입·재사용하는 모델을 명시하라. 그에 맞춰 AC4.1.2 분류(N/A의 "UI는 재방문 시 자연 활용" 근거)와 NFR4 책임을 재검토하라. | Resolved (reviewer) |
| R-03 | Major | functional-spec.md > §4 WF2 step 4~5 (x축=calendar.nightStart/End, 음영=astro.*Twilight); frontend-components.md > §4 DualAxisChart | x축 도메인은 calendar.nightStartKst~nightEndKst(U3)로, 박명·완전한 밤 음영은 astro.*Twilight·fullDark(U1)로 정의하는데, computeAstronomy 호출 시 calendar의 밤 범위(nightStartKst/nightEndKst)를 AstronomyInput에 넘긴다는 명세가 없다. 넘기지 않으면 U1은 BR3.2 기본 범위(18:00~익일 06:00)를 쓰므로(src/astronomy/types.ts·night-range) x축(달력 기준)과 음영·월출몰(천문 기준)이 서로 다른 밤 범위로 산출돼 어긋날 수 있다. | §2/§4에 computeAstronomy 입력으로 calendar.nightStartKst/nightEndKst를 AstronomyInput.nightStartKst/nightEndKst에 전달한다는 조립 규칙을 명시해 x축·음영·월출몰이 동일 밤 범위를 공유하도록 못박아라. | Resolved (reviewer) |
| R-04 | Minor | functional-spec.md > §4 WF2 step 5; frontend-components.md > §4 DualAxisChart annotation 개요 | 박명 음영 box를 `astro.*Twilight`의 start/end로 그린다고만 하고, 이들이 null일 수 있음(TwilightWindow.start/end: `string \| null`, C1 갱신; 서울 하지 무렵 천문박명 미성립 → astronomicalTwilight·fullDark가 null)을 음영 렌더에서 다루지 않는다. fullDark "없음"은 §NightSummary 요약에서만 처리하고 annotation box 생략 규칙은 비어 있다. | 각 박명/완전한 밤 음영 box에 대해 start 또는 end가 null이면 해당 box를 생략한다는 null 처리 규칙을 §4(음영)와 frontend-components DualAxisChart에 추가하라. | Resolved (reviewer) |
| R-05 | Minor | traceability.json > NFR4 (status N/A); user-stories/stories.md > 비기능 커버리지 | 상위 stories.md는 NFR4를 "OK — US4.1(열 때 fetch + 짧은 캐시)"로 기대하는데, 트레이서빌리티는 NFR4를 전부 N/A("캐시는 u2-weather-data 소유")로 분류한다. UI-only 단위라는 점에서 일부 타당하나, 위 Major(캐시 주입)와 함께 보면 UI도 공유 캐시 재사용으로 NFR4에 기여하므로 완전 N/A는 UI 책임을 과소 기록한다. | NFR4를 OK(공유 캐시 재사용·열 때 fetch 책임을 UI 몫으로 명시)로 올리거나, N/A target에 "UI는 U2 캐시를 주입·재사용함"을 추가해 stories.md 기대와 일치시켜라. | Resolved (reviewer) |
| R-06 | Minor | frontend-components.md > §5.5 "안전 렌더 유지(NFR6.2)" 항목 | 안전 렌더(innerHTML 금지/textContent) 요구에 `NFR6.2`를 인용하나, 상위 requirements.md의 NFR6은 하위 번호(.2)가 없는 단일 보안 요구(비밀값 하드코딩 금지)이고 `.2` 접미 ID는 상류에서 해소되지 않는다. 안전 렌더는 설계 자체로 명확해 구현에 영향은 없으나 추적 참조가 틀렸다 | 안전 렌더 근거를 실재하는 상위 ID로 교정한다(보안이면 `NFR6`, 또는 해당 표시 요구가 있는 FR/AC). 없으면 "설계 결정"으로 중립 표기하고 가짜 하위 ID 인용을 제거한다 | New |
| R-07 | Minor | construction/u4-web-ui/functional-design/functional-spec.md > §2.1 moonHourly relativeBrightnessPct | "남중(transit)=100% 기준"이라 했으나, 샘플링 범위(그날 밤 nightStartKst~nightEndKst)에 달의 남중이 포함되지 않는 밤(월출만 있거나 월몰만 있는 밤)의 100% 기준 정의가 명시되지 않았다. 범위 밖 남중 고도를 기준으로 쓰는지, 범위 내 최대 고도를 쓰는지에 따라 곡선 스케일이 달라져 결정성이 흔들릴 수 있다(산출 로직은 U1 소유로 이미 플래그됨). | U1 code-generation에서 기준(transit) 고도의 정의를 "달의 실제 천체 남중 고도(범위 밖이어도 그 밤의 이론 남중)"로 고정하고 주석에 근거를 남겨, 범위 내 남중 유무와 무관하게 상대 밝기가 결정적이 되도록 한다. | New |
| R-08 | Minor | construction/u4-web-ui/functional-design/functional-spec.md > §4 step4 좌y축 / frontend-components.md > §4 DualAxisChart yMoon | 좌y축(yMoon 0~100)에 곡선값 `relativeBrightnessPct`(남중=100% 상대 체감)와 요약 스칼라 `moonIlluminationPct`(위상 조도%)가 같은 0~100 축 의미를 공유하는 듯 읽힐 소지가 있다. 둘은 서로 다른 의미의 백분율이다(하나는 남중 대비 상대, 하나는 illuminated fraction). 현재 범례·요약 라벨("달 밝기(위상)")로 구분은 되나 축 라벨 차원의 명시가 없다. | DualAxisChart 좌y축/범례에 "남중 대비 상대 체감 밝기(%)"임을 축 또는 범례 텍스트로 명시해, 요약의 위상 조도%와 혼동되지 않게 한다(설계 수준 보강; 구현은 code-generation). | New |
| R-09 | Minor | construction/u4-web-ui/functional-design/functional-spec.md > §4 step7 월출·월몰 null / inception/contract-design/contract-summary.md > C1 moonrise/moonset 주석 | 상위 C1 계약 주석은 null을 "월출 없음"/"월몰 없음"(라벨+값)으로 예시했으나, 이번 리비전은 값 단독 "없음"(라벨 "월출"/"월몰"이 맥락 제공)으로 세분한다. 전달 정보는 동일하고 AC3.2.3("없음" 표시, 라벨-값 중복 금지)에 부합하여 모순은 아니나, 상위 주석의 예시 문구와 UI 렌더 형태가 표면적으로 달라 보인다. | 모순 아님(정보 동치·AC3.2.3 준수). 혼동 방지를 위해 C1 주석의 "월출 없음" 예시가 "라벨 행 + 값 '없음'"의 축약 표기임을 UI 측 설계에 한 줄로 남겨두면 추적이 깔끔하다. 필수 아님. | New |

> R-06 Not re-checked this round

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| src/astronomy/types.ts 대조(수동) | PASS | 현재 `AstronomyResult`에 `moonIlluminationPct`·`TwilightWindow(start/end nullable)`·`fullDark*`·`moonrise/moonset: string\|null` 존재. 제안 `moonHourly[]`는 순수 추가 필드로 기존 형상과 충돌 없음(additive). `moonIlluminationPct` 유지 확인. |
| traceability AC 매핑 점검(수동) | PASS | AC3.1.1/3.1.2/3.1.3·AC3.2.1~3.2.3 가 WF2 step4~8·DualAxisChart·NightSummary로 커버. null="없음"(AC3.2.3)·색 비의존(NFR1) 일관. 로직 소유 AC는 소유 단위와 함께 N/A 명시. |

### Summary

리비전은 정합적이고 구현 가능하다 — C1 `moonHourly[]`는 additive하고 `moonIlluminationPct`를 보존하며, 세 가지 표시 수정(KST HH:MM 포맷·음영 농도 차등+내부 라벨·요약 null="없음" 값 단독)이 두 산출물과 상위 계약에 일관되게 반영됐다. 남은 것은 U1 산출식의 transit 기준 정의 등 code-generation에서 못박을 경미 사항뿐으로, READY를 막지 않는다.
