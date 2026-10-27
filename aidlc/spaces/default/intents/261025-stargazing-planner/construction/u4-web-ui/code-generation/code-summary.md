# Code Summary — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui, 번들 진입점). 승인된 code-generation-plan.md(Step 1~17 + 재작업 Step 15.5)를 test-after로 빌드. 애플리케이션 코드는 워크스페이스 루트, 산출물 문서는 기록 디렉터리.

## 재작업 이력 (2026-10-27, 2차 반려 — 상세 그래프 보완)

2차 체크포인트 반려(상세 그래프 품질)에서 지적된 5개 결함을 수정했다. U4 UI와 **상류 U1(C1 계약) 확장**을 함께 건드리며, 승인된 code-generation-plan.md의 Step 11.5·11.6·11.7·12·13을 그대로 빌드했다(계획 재작성 없음).

- **Fix A (Step 11.5) — C1 `moonHourly` 확장 + 시간별 체감 밝기 계산.**
  - `src/astronomy/types.ts`: `AstronomyResult`에 `moonHourly: MoonHourlySample[]` 추가(기존 `moonIlluminationPct` 위상 스칼라는 카드·요약용으로 유지). `MoonHourlySample = { hourKst; altitudeDeg; relativeBrightnessPct }` 신설·index 재노출.
  - `src/astronomy/astronomy.ts`: 밤 범위를 30분 간격으로 샘플링, 각 시각 달 고도(Equator+Horizon) → 상대 체감 밝기 = sin(고도)[입사각] × 10^(−0.4·k·airmass)[대기 소광, Kasten-Young airmass·k=0.23 mag/airmass]. **그날 실제 천문 남중 고도(SearchHourAngle, 밤 범위 밖이어도 참조)에서 100%로 정규화**, 고도 ≤ 0은 0%. 위상 스케일은 전 샘플 공통이라 정규화에서 상쇄되어 결정적이다. 반올림은 출력 경계만(BR4.1).
- **Fix B (Step 11.6) — `computeMoonRiseSet` 비대칭 버그(defect 6) 수정.** 종전 월출·월몰을 모두 `range.startUtc`에서 전방 탐색해 "월출만 있고 월몰 null" 인공 결과가 생겼다. 월몰을 월출 이후부터(월출이 없으면 범위 시작부터) 탐색하도록 바꿔 대칭화. 둘 다 null 가능성은 유지.
- **Fix C (Step 11.7) — u1 회귀 테스트.** `src/astronomy/__tests__/moonHourly.test.ts` 신규(8 tests): 남중≈100%, 고도≤0=0%, 월출→남중 단조 증가·남중→월몰 단조 감소, 저고도 월출 근처 남중 대비 현저히 낮음, 월출 있으면 월몰도 탐색(대칭성). 기존 `astronomy.test.ts`의 "독립 null" 테스트는 구(舊) 전방탐색 전제를 담아 Fix B 후 실패하므로 대칭 탐색 기준으로 갱신(기능 동일, 기대 재계산).
- **Fix D (Step 12) — chart.ts.**
  - (5) `buildMoonBaseline` 제거 → `buildMoonCurve`로 `astro.moonHourly` 시계열 꺾은선(남중=100%). 좌y축 제목 "상대 밝기 %(남중=100)".
  - (2) X축: 내부 epoch ms 유지, `ticks.callback`에서 `formatKstHourMinute(epoch→KST "HH:MM")`로 눈금 라벨 렌더(원본 epoch 숫자 노출 금지).
  - (7/8) 박명 음영: 시민(0.10)<항해(0.20)<천문(0.32)<완전한 밤(0.48)로 배경 alpha 차등, 어두운 음영이 위로 오도록 정렬, 각 box `label.display:true`로 구간 라벨("시민"/"항해"/"천문"/"완전한 밤") 표시. 경계 null이면 box 생략 유지.
  - 단위 테스트(`chart.test.ts`)·픽스처(`fixtures.ts`에 `makeMoonHourly`) 갱신.
- **Fix E (Step 13) — "월몰 월몰 없음" 중복 제거.** `summaryView.ts`의 None 상수를 값만으로(`'없음'`) 변경 — `detailView.renderSummary`가 라벨("월출"/"월몰"/"완전한 밤")을 별도 span으로 렌더하므로 라벨+값이 "월몰 없음"으로 읽힌다(종전 "월몰 월몰 없음" 제거). AC3.2.3(null 명시) 유지. `detailView.renderLegend`의 낡은 "달 밝기: 수평 기준선" 문구를 "달 체감 밝기: 시간별 곡선(남중=100%)"으로 갱신, 요약 행 라벨을 "달 위상"으로 바꿔 곡선(체감 밝기)과 구분. 관련 테스트(summaryView·detailView.dom) 갱신.

**안전 렌더·의존성 고정 유지:** 모든 텍스트 바인딩은 `textContent`(innerHTML 미도입), `package.json` 핀(vitest 2.1.9/coverage 2.1.9/vite 5.4.11/chart.js 4.4.7/annotation 3.1.0/happy-dom 15.11.7/eslint 9.17.0)은 이번 재작업에서 변경하지 않았다(의존성 install로 버전을 올리지 않음).

## 재작업 이력 (2026-10-27)

- 체크포인트 사람 반려: 실제 화면이 맨 텍스트(스타일시트 누락). 원인은 설계·구현 양쪽 — frontend-components가 스타일시트를 명세하지 않았고(functional-design §5.5로 보완), code-gen이 className만 붙이고 CSS를 안 만듦.
- 보완: `src/web-ui/styles.css` 신설(뷰가 실제 쓰는 className에 1:1 스타일), `src/main.ts`에서 import해 Vite 번들 포함. 차트 미표시의 실제 원인이던 `.chart-wrap` 부모 높이 미지정을 고정 높이 320px·100% 폭으로 해결(Chart.js canvas는 부모 높이 의존). 로직·테스트·월출몰 "없음" 표시 결정은 그대로 유지.
- 의존성 버전 정합 교정(조정자): 스타일 재작업 중 `npm install`이 고정 버전을 캐럿 범위로 풀고 vitest를 2→4로 올려(`@vitest/coverage-v8`는 5로) 커버리지 검증이 `coverageFilesDirectory is required`로 깨졌다. package.json을 원래 정합 세트로 되돌려 정확히 고정: vitest 2.1.9 + @vitest/coverage-v8 2.1.9, vite 5.4.11, chart.js 4.4.7, chartjs-plugin-annotation 3.1.0(런타임 번들 의존이라 dependencies로), happy-dom 15.11.7, eslint 9.17.0 핀 복원. 재설치 후 `npx tsc --noEmit && npx vitest run --coverage` 정상 통과(핵심 계산 모듈 커버리지 플로어 충족). 교훈: 새 의존성 추가 시 기존 고정 버전을 범위로 풀거나 메이저를 올리지 말 것.

## 생성/수정 파일

**애플리케이션 코드 (워크스페이스 루트):**
- 신규 `index.html` — 다크모드 기본 테마·모바일 뷰포트, `#app` 마운트 포인트
- 신규 `src/main.ts` — 브라우저 진입점, AppRoot를 `#app`에 마운트
- 신규 `vite.config.ts` — 정적 번들 설정(outDir `dist-web`)
- 신규 `src/web-ui/`:
  - `types.ts` — `ViewState`, `NightView` 뷰모델, `DEFAULT_LOCATION`(서울 좌표)
  - `styles.css` — 전용 스타일시트(카드·추천 강조·상세·`.chart-wrap` 고정 높이·요약·범례·버튼·반응형·다크 대비). main.ts에서 import, Vite 번들 포함. 안전 렌더(class 토글만) 유지
  - `state.ts` — `mapState` 순수 상태 매핑(§5: loading/ok/partial/error), 내부 사유 비노출
  - `assembler.ts` — `NightViewAssembler` 점진 2단계 조립(U1 동기 즉시 + U2 Promise 지연 → U3 recommend → mapState), U1/U2/U3 주입식
  - `recommendationView.ts` — `recommend.verdict`만 읽어 카드 강조 속성 산출(색 비의존)
  - `summaryView.ts` — 핵심 숫자 요약 순수 매핑(월출·월몰·완전한 밤 null → "없음" 명시 표시, AC3.2.3)
  - `cloudSummary.ts` — 구름 요약 텍스트(known 평균 / outOfHorizon 안내 / unknown 중립 문구)
  - `listView.ts` — WF1 메인 목록(스켈레톤·Promise.all 병렬 조립·카드·추천 강조·탭 네비)
  - `chart.ts` — Chart.js + annotation 이중축 래퍼(달 밝기 수평 기준선·구름량 곡선·박명 음영·단일 인스턴스 갱신)
  - `detailView.ts` — WF2 상세(차트·요약·범례·뒤로가기)·WF3 재시도
  - `app.ts` — AppRoot(공유 DataCache 단일 인스턴스·nowMs·해시 라우팅)
  - `index.ts` — 공개 재노출
- 수정 `package.json` — devDependency 추가(`vite`, `chart.js`, `chartjs-plugin-annotation`, `happy-dom`), 스크립트 추가(`dev`, `build:web`; 기존 `build`/`test`/`lint`/`format` 보존)
- 수정 `package-lock.json` — 의존성 설치 반영
- 수정 `.gitignore` — `dist/`·`dist-web/` 추가

**테스트 (`src/web-ui/__tests__/`):**
- `fixtures.ts` — mock U1/U2/U3 팩토리(고정 객체)
- `types.test.ts`, `state.test.ts`, `assembler.test.ts`, `recommendationView.test.ts`, `summaryView.test.ts`, `cloudSummary.test.ts`, `chart.test.ts`, `app.test.ts`, `detailView.dom.test.ts`(happy-dom)

## 핵심 구현 결정
- **점진 렌더(PD1)**: assembler가 U1 동기 계산을 먼저 반환해 골격을 그리고, U2 Promise는 지연 수집해 구름·추천을 채운다. astro throw는 error로 격리해 천문 실패만 화면을 막는다.
- **공유 캐시(PD3)**: AppRoot가 DataCache 단일 인스턴스·nowMs를 보유해 모든 getCloudForecast 호출에 주입. 재방문·재시도 캐시 히트.
- **월출·월몰 "없음" 표시(AC3.2.3 확정)**: `summaryView.toNightSummaryView`가 null 경계를 "월출 없음/월몰 없음/완전한 밤 없음"으로 명시 표시(생략하지 않음). 상류 u1 결정(생략)을 뒤집은 최종 결정 반영.
- **안전 렌더(NFR6.2/SD2)**: 모든 사용자 노출 텍스트는 `textContent` 바인딩만 사용, `innerHTML` 미사용.
- **내부 사유 비노출(NFR6.3/SD3)**: C2 `reason`·`AstronomyComputationError.code`를 상태 매핑 계층에서 차단, 중립 문구만 표시.
- **달 밝기 시간별 곡선(§2.1 갱신, 2차 재작업)**: 종전 수평 기준선을 폐기하고 좌y축을 `astro.moonHourly` 시계열 꺾은선(남중=100% 정규화)으로 그린다. 차트 x축은 epoch ms `linear` 스케일로 time 어댑터 의존을 제거하되, 눈금 라벨은 `ticks.callback`으로 KST "HH:MM"만 표시한다.
- **순수 함수 분리**: 표시 매핑 로직(summaryView·cloudSummary)을 뷰에서 분리해 단위 테스트 집중.

## 테스트 커버리지 요약
- 전체 스위트 `npx tsc --noEmit && npx vitest run --coverage`: **147 passed / 0 failed**(17 test files). u1/u2/u3/u4 기존 테스트 전부 green.
- **u1 핵심 계산 모듈 커버리지 플로어**(2차 재작업으로 변경된 모듈): `npx vitest run src/astronomy --coverage --coverage.include='src/astronomy/**'` → **라인 92.1%**(astronomy.ts 95%), 80% 플로어 충족. index.ts는 재노출 배럴이라 0%(실행 로직 없음, 다른 index 배럴과 동일 성격) — 단위 전체로 플로어 초과. 플로어·테스트 설정은 낮추지 않음.
- u4(UI)는 80% 라인 커버리지 플로어 비대상(team.md Q4). 순수 로직(상태 매핑·조립·추천/요약/차트 구성 매핑)에 테스트 집중, 실제 DOM 렌더링·Chart.js 그리기는 수동 스모크.
- `npx tsc --noEmit` 통과.

## 이 단계에서 실행하지 않은 테스트
- 없음. u4의 모든 단위 테스트가 이 단계에서 실행되어 통과했다(외부 날씨 API는 전부 mock, 네트워크 호출 없음).
- 실제 화면 렌더링·Chart.js 그리기·반응형 레이아웃·다크모드 대비는 **수동 스모크**로 보완한다(team.md: UI 렌더링은 플로어·자동 테스트 비대상). 자동 E2E는 이 MVP 범위 밖.

## 계획 대비 편차 (경미)
1. **Vite 산출 디렉터리**: 루트 `dist`(tsconfig outDir)와 충돌 피하려 Vite outDir을 `dist-web`로 지정, `.gitignore`에 `dist/`·`dist-web/` 추가. 기능·계획 의미 불변.
2. **순수 함수 모듈 추가**: 계획이 명시한 파일 외에 `summaryView.ts`·`cloudSummary.ts`를 분리 신설해 표시 매핑을 순수 함수로 테스트 가능하게 함. 계획 Step 11·13의 로직을 분해한 것으로 기능 범위 동일.
3. **차트 x축**: time 어댑터 의존을 피해 epoch ms `linear` 스케일로 구성. 수평 기준선·annotation 경계를 ms로 일관 처리(§2.1·§4 의미 동일).
