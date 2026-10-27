### NFR Design 리뷰 — u4-web-ui

**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1
**Verdict Dictated:** no
**Date:** 2026-10-27T08:24:20Z

### Review

표시 전용 UI 단위(u4-web-ui)의 NFR Design 산출물 4종(performance-design, security-design, logical-components, traceability)을 상위 계약(contract-summary C1·C2·C3), NFR requirements(NFR3.1~3.5·NFR6.1~6.4), functional-spec와 대조해 적대적으로 검증했다. 핵심 설계 주장은 대체로 계약과 정합하며, 구현 코드가 아니라 설계 수준 패턴(≤15줄 스케치)으로 유지된다. 하나의 서술상 모순을 발견했으나 설계를 막을 정도는 아니다.

### 손으로 확인한 사항

- **traceability 완전성**: `upstream_ids`가 NFR3.1·NFR3.2·NFR3.3·NFR3.4·NFR3.5·NFR6.1·NFR6.2·NFR6.3·NFR6.4 전 9개를 열거하며, 이는 performance-requirements·security-requirements의 NFRx.y 집합과 정확히 일치한다. 누락·과잉 없음.
- **매핑 실재성**: 각 coverage 항목의 target(PD1·PD2·PD1·PD3·PD4·SD1·SD2·SD3·SD4)이 실제 산출물에 존재하는 결정을 가리킨다. PD1~PD4는 performance-design.md에, SD1~SD4는 security-design.md에 모두 정의되어 있다. 허상 참조 없음.
- **sync-first/async-later 정합(PD1)**: performance-design PD1과 ≤15줄 스케치는 즉시 단계에 computeAstronomy(C1 동기)·listCandidateDates(C3 동기)를 두고, getCloudForecast(C2 Promise) 도착 후에 recommend(astro, cloud)를 호출한다. C3 `recommend(astro, cloud)` 시그니처(구름 필요)와 정합.
- **달 밝기 수평 기준선**: logical-components NightDetailView가 "달 밝기 수평 기준선/구름량 곡선"으로 명시하며, functional-spec §2.1·§4의 "단일 스칼라 → 수평 기준선(시간별 곡선 아님)"과 일치. 시계열 곡선으로 오기한 산출물 없음.
- **공유 캐시 주입(PD3)**: AppRoot가 DataCache 단일 인스턴스와 nowMs를 보유해 WF1·WF2·WF3의 모든 getCloudForecast에 주입한다는 PD3가 functional-spec §5.1과 정합.
- **설계 수준 유지**: performance-design 스케치는 "≤15줄, 구현 아님"으로 명시된 약 12줄 의사코드이며, 나머지는 YAML/Mermaid 패턴 기술이다. 구현 코드 아님.
- **보안 과잉·내부 사유 노출 여부**: SD3가 C2 `reason`(로그 전용)과 `AstronomyComputationError.code`를 화면 비노출로 두고 중립 문구만 매핑. SD1은 비밀값 비포함, 키 불필요 공개 API 위임으로 project.md Forbidden·무료 티어 규칙과 정합. 과대 주장이나 규칙 위반 없음.

### 확인하지 못한 사항

- 자동 검증 도구가 지정되지 않아 traceability.json은 손으로만 대조했다(상기 결과). 프레임워크 센서 외 실행 가능한 도구가 없어 이는 NOT-READY 사유가 아니다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261025-stargazing-planner/construction/u4-web-ui/nfr-design/logical-components.md > components > NightViewAssembler responsibility | NightViewAssembler 책임 설명이 "U1 computeAstronomy(동기)+U3 recommend(동기)를 즉시" 단계에서 수행한다고 적었으나, recommend는 (astro, cloud)를 입력으로 받으므로 구름 예보가 도착하는 지연 단계 이후에야 호출될 수 있다. 같은 문서가 참조하는 performance-design PD1·스케치와 functional-spec §2는 recommend를 지연 단계에 올바르게 배치하고 있어, 이 문장만 계약(C3)·동반 산출물과 어긋난다. | 해당 책임 문장을 PD1과 일치하도록 수정한다. 즉 즉시 단계는 computeAstronomy·골격 산출로, recommend는 getCloudForecast 도착 후 지연 단계로 명시한다. | New |

### Summary

traceability의 NFR 열거·매핑이 완전하고 모든 target이 실재하며, 핵심 조립/렌더/보안 패턴이 C1·C2·C3 계약과 정합한다. 유일한 발견은 logical-components 한 문장이 recommend 호출 시점을 즉시 단계로 잘못 서술한 Minor 수준의 서술 모순이며(동반 산출물 PD1은 올바름), 구현을 막지 않으므로 READY로 판정한다.
