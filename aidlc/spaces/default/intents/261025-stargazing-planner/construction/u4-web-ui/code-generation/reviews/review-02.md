**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1
**Verdict Dictated:** no
**Date:** 2026-10-27T12:57:05Z

### Review

이전 반려 사유(실행 화면이 스타일 없는 맨 텍스트, 차트가 0 높이로 미표시)가 실제로 닫혔는지 적대적으로 재검증했다. 뷰 코드가 부여하는 className을 전수 수집해 `styles.css` 규칙과 1:1 대조하고, import·번들 포함·차트 높이·안전 렌더·비밀값·테스트·커버리지 측정 방식을 모두 확인했다. 간극은 닫혔고 회귀는 없다.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | src/web-ui/listView.ts > error 카드 분기 (`if (night.state === 'error')`) | error 상태 카드는 "천문 계산 실패 — 눌러서 다시 시도"와 함께 상세 재시도로 이동하는 경로지만, `renderCard`는 재시도 아이콘/라벨을 색 외 보조 형태로 특별히 강조하지 않는다. 추천 강조(별+라벨)와 달리 error 상태의 시각적 구분은 텍스트 1줄에 의존한다. 기능 결함은 아니나 수동 스모크에서 다크모드 대비·접근성 확인이 필요하다. | 수동 스모크 체크리스트에 error 카드의 색 비의존 식별성(아이콘/라벨/대비)을 명시적으로 포함한다. | New |
| R-02 | Minor | src/web-ui/chart.ts > `buildAnnotations` / `renderDetail`의 chart try/catch | 테스트 환경 외 실제 Chart.js 그리기·annotation 음영은 단위 테스트에서 제외되고(team.md 방침과 일관) `detailView`의 `try/catch`가 canvas 컨텍스트 부재를 조용히 삼킨다. 정상 범위이나, 실제 브라우저에서 렌더 실패가 무음으로 묻힐 여지가 있다. | 수동 스모크에서 실제 이중축·박명 음영·단일 인스턴스 갱신(PD4)을 브라우저로 1회 확인하고, 필요 시 렌더 실패에 대한 사용자 안내(현재는 요약만 유지) 추가를 검토한다. | New |

> R-01 Not re-checked this round

> R-02 Not re-checked this round

### 검증 상세 (근거)

**(1) className ↔ 스타일 규칙 전수 대조 — 간극 닫힘.** `listView.ts`·`detailView.ts`가 실제로 부여하는 모든 className(`night-list`, `night-card`, `night-card skeleton`, `recommended`, `card-header`, `card-title`, `recommend-badge`, `card-moon`, `card-cloud`, `card-error`, `empty-state`, `detail-loading`, `detail-content`, `detail-title`, `cloud-notice`, `chart-wrap`, `night-summary`, `summary-row`, `summary-label`, `summary-value`, `chart-legend`, `legend-item`, `detail-error`, `error-message`, `back-button`, `retry-button`)이 `src/web-ui/styles.css`에 대응 규칙을 가진다. `cloud-notice partial`·`cloud-notice far-date`의 `partial`·`far-date`는 `data-testid`와 짝이 되는 변형 토큰으로, 스타일은 `.cloud-notice` 본체가 완결하므로 스타일 누락이 아니다. 계획 §15.5가 언급한 `.chart-container`는 뷰가 실제로 쓰지 않으며, 뷰가 쓰는 클래스는 `.chart-wrap`이고 그 규칙이 존재한다 — 맨 텍스트 렌더의 직접 원인(규칙 없는 className)은 남아 있지 않다.

**(2) import·번들 포함 확인.** `src/main.ts`가 `import './web-ui/styles.css'`로 스타일시트를 올린다. `npx vite build`가 성공하며 `dist-web/assets/index-CpZizqFw.css`(3.70 kB)를 산출하고, 그 번들에 `.night-card{...}`·`.chart-wrap{...}`·`.recommend-badge{...}` 등 컴포넌트 규칙이 실제로 포함됨을 확인했다(index.html 인라인 토큰만이 아니라 `styles.css` 규칙이 번들됨).

**(3) 차트 컨테이너 높이 — 0 높이 미표시 원인 해소.** 뷰가 쓰는 `.chart-wrap`에 `height: 320px`·`width: 100%`가 명시되어 있고(`maintainAspectRatio: false`와 짝), 산출 번들 CSS에서도 `height:320px`를 확인했다. canvas는 `.chart-wrap canvas { width/height: 100% !important }`로 부모를 채운다.

**(4) 안전 렌더 유지.** `innerHTML`·`outerHTML`·`insertAdjacentHTML`·`document.write`는 코드에 없다(주석만 존재). 모든 사용자 노출 문자열은 `setText`→`textContent`로만 바인딩되고, 스타일은 class 토글(`className`/`classList.add`)로만 적용된다(NFR6.2 유지).

**(5) 비밀값.** `src/web-ui/` 전역 및 `styles.css`에서 `api[_-]?key|secret|token|password|authorization|bearer` 패턴 없음. U2가 키 불필요 공개 API를 쓰는 전제와 일치(NFR6.1).

**(6) 회귀·커버리지 측정.** `npx vitest run src/web-ui` → 9 파일 46 테스트 전부 통과(green). `npx tsc --noEmit` 오류 0. `vitest.config.ts`는 변경되지 않았다(핵심 계산 모듈 전용 플로어를 `--coverage.include` 경로 한정으로 측정하는 방식 그대로이며, u4는 플로어 비대상). 이 리비전이 핵심 모듈 80% 플로어를 낮추지 않는다.

**(7) 색 비의존 강조.** recommended = `.night-card.recommended`(노란 2px 테두리, 색) + `.recommend-badge`(별 아이콘 `⭐` + "추천" 라벨 텍스트, 형태·텍스트)의 3중. 색 단독이 아니다(NFR1·AC2.1.4 유지).

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| npx vitest run src/web-ui | PASS: 9 files, 46 tests passed | 기존 테스트 green 유지, 회귀 없음 |
| npx tsc --noEmit | PASS: exit 0, 오류 0 | 타입 안정성 유지 |
| npx vite build | PASS: `dist-web/assets/index-CpZizqFw.css` (3.70 kB) 산출 | 스타일시트가 번들에 포함(컴포넌트 규칙·`height:320px` 확인) |

### Summary

반려의 두 간극(스타일 없는 맨 텍스트, 0 높이 차트)이 모두 닫혔다: 뷰가 쓰는 className 전부에 대응 규칙이 있고, `styles.css`는 import되어 번들에 포함되며, `.chart-wrap`에 명시 높이가 있다. 안전 렌더·비밀값 부재·색 비의존 강조가 유지되고, 46개 테스트가 green이며 커버리지 측정 방식은 변경되지 않았다. 적대적으로 깨뜨리려 했으나 블로킹 결함을 찾지 못했다 — READY.
