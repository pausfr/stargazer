**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1
**Verdict Dictated:** no
**Date:** 2026-10-27T12:46:41Z

### Review

u4-web-ui NFR Design 재검토(스테일 리시트 복구). functional-design §5.5 스타일링 명세 추가와
code-generation 보완은 NFR Design 산출물(performance-design / security-design /
logical-components / traceability)을 건드리지 않았다. 적대적 관점으로 네 산출물을 깨뜨리려
시도했으나(열거 누락·매핑 공백·계약 위반·설계 수준 이탈·컴포넌트 경계 붕괴) 재현 가능한 증거로
뒷받침되는 결함을 찾지 못했다. 산출물은 그대로 성립한다.

### 검증 내역 (적대적 시도와 결과)

- **NFRx.y 전수 열거·매핑**: `traceability.json`의 `upstream_ids`는 NFR3.1~3.5·NFR6.1~6.4 아홉 개
  전부를 담고, `coverage` 아홉 행이 모두 `OK`로 실재 PD/SD 솔루션을 가리킨다.
  상류 `performance-requirements.md`는 정확히 NFR3.1~3.5를, `security-requirements.md`는 정확히
  NFR6.1~6.4를 정의한다 — 미매핑 요구도, 유령 ID도 없음. 각 매핑 대상(PD1·PD2·PD3·PD4·
  SD1·SD2·SD3·SD4)은 설계 문서에 실재한다.
- **PD1 sync-first / async-later**: C1 `computeAstronomy` `sync: true`, C3 `recommend`/
  `listCandidateDates` `sync: true`, C2 `getCloudForecast` `sync: false`(Promise)와 정합.
  "천문 즉시 렌더 → 날씨 도착 후 갱신" 조립 순서가 계약 시그니처와 어긋나지 않는다.
- **PD3 공유 캐시**: C2 시그니처 `getCloudForecast(query, options)`에 `options.cache`/`nowMs`
  주입이 가능하고, functional-spec §5.1이 "App 루트 단일 `DataCache` 인스턴스를 모든 호출에 주입"을
  못박는다. PD3·logical-components(AppRoot `covers: NFR3.4`)와 일치.
- **달 밝기 수평 기준선(PD4)**: functional-spec §2.1·§4가 `moonIlluminationPct`를 그날 밤 단일
  스칼라(시계열 아님)로 규정하고, 수평 기준선 표기를 명시한다. PD4의 "단일 Chart.js 인스턴스·
  data 갱신"과 정합이며, C1에 시간별 조도가 없다는 계약 사실과도 어긋나지 않는다.
- **SD3 내부 사유 비노출**: C2 `reason`은 "로그 전용, UI 비노출". SD3는 `CloudForecast.reason`·
  `AstronomyComputationError.code`를 상태 매핑 계층에서 차단하고 중립 문구만 노출한다 — 계약과 일치.
- **설계 수준 한정**: PD1~PD4·SD1~SD4·logical-components 모두 패턴·책임 경계 수준에 머물고,
  구체 파일/프레임워크/버전은 code-generation으로 연기한다. 구현 코드 혼입 없음.
- **§5.5 스타일링 명세의 비파급**: §5.5는 `src/web-ui/styles.css` 전용 스타일시트와 className↔
  규칙 쌍을 요구하는 **코드 수준 산출물**이지 새 논리 컴포넌트 경계가 아니다. logical-components는
  명시적으로 "구현 파일 1:1 매핑이 아닌 책임 경계"라고 선언하며, 스타일링은 두 뷰 컴포넌트
  (HolidayListView·NightDetailView)의 렌더 책임 안에 포섭된다. 4-컴포넌트 분해(AppRoot·
  NightViewAssembler·HolidayListView·NightDetailView)는 그대로 성립한다. 또한 §5.5가
  "class 토글로만 적용, 사용자 노출 문자열은 계속 `textContent` 바인딩, `innerHTML` 금지"를
  명문화하므로 SD2(안전 렌더)와 충돌하지 않고 오히려 보강한다. NFR Design 산출물 변경 불요.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u4-web-ui/nfr-design/logical-components.md > components > NightViewAssembler responsibility | NightViewAssembler 책임 설명이 "U1 computeAstronomy(동기)+U3 recommend(동기)를 즉시" 단계에서 수행한다고 적었으나, recommend는 (astro, cloud)를 입력으로 받으므로 구름 예보가 도착하는 지연 단계 이후에야 호출될 수 있다. 같은 문서가 참조하는 performance-design PD1·스케치와 functional-spec §2는 recommend를 지연 단계에 올바르게 배치하고 있어, 이 문장만 계약(C3)·동반 산출물과 어긋난다. | 해당 책임 문장을 PD1과 일치하도록 수정한다. 즉 즉시 단계는 computeAstronomy·골격 산출로, recommend는 getCloudForecast 도착 후 지연 단계로 명시한다. | New |

> R-01 Not re-checked this round

### Summary

NFR Design 네 산출물은 §5.5 스타일링 보완 이후에도 그대로 성립한다. NFRx.y 전수 매핑, 계약 정합
(PD1 sync/async·PD3 공유 캐시·달 밝기 수평 기준선·SD3 사유 비노출), 설계 수준 한정이 모두 유지되고,
스타일링은 코드 수준이라 4-컴포넌트 경계를 바꾸지 않는다. READY.
