# Integration Test Instructions — stargazing-planner

> Test Strategy: **Standard**. 단위 경계 간 상호작용(cross-unit)과 주요 통합
> 경로를 다룬다. 이 앱은 백엔드 없는 정적 클라이언트라 "통합"은 단위 간 계약
> (C1·C2·C3) 경계와 UI 조립 경로가 핵심이다.

## 프레임워크·실행

- 러너: Vitest(루트 `vitest.config.ts`). DOM 필요 테스트는 파일 상단
  `// @vitest-environment happy-dom`.
- 전체 통합+단위 스위트 실행:

```bash
npx vitest run
```

- 커버리지 포함 전체 검증(사람 승인 Construction 검증 명령):

```bash
npx tsc --noEmit && npx vitest run --coverage
```

## 주요 통합 경계(cross-unit)

1. **U4 조립 경로 (U1×U2×U3 → NightView)** — `src/web-ui/__tests__/assembler.test.ts`.
   `NightViewAssembler`가 U1 `computeAstronomy`(동기, C1)·U2 `getCloudForecast`
   (Promise, C2)·U3 `recommend`(C3)를 점진 2단계로 조립하고 상태(ok/partial/
   error/outOfHorizon)를 매핑하는지 mock 주입으로 검증. 계약 경계를 넘는 데이터
   형태·실패 격리(천문 throw→error, 날씨 unknown→partial)를 다룬다.
2. **C1 계약 확장 정합 (U1 moonHourly → U4 차트)** — `src/web-ui/__tests__/chart.test.ts`.
   U1이 산출한 `moonHourly` 시계열을 U4 차트가 꺾은선으로 그리고 x축 KST 포맷·
   박명 음영 밴드·월출몰 세로선을 구성하는지 검증(실제 Chart.js 그리기는 수동 스모크).
3. **U3 추천 규칙 → U4 표시 매핑 (C3)** — `src/web-ui/__tests__/recommendationView.test.ts`.
   `recommend.verdict`만 읽어 카드 강조(색 비의존)로 매핑, UI가 임계값 로직을
   갖지 않음(U3 소유)을 확인.
4. **U2 캐시 주입 경로 (C2, 공유 DataCache)** — `src/weather/__tests__/cache.test.ts`
   + 조립 테스트의 `nowMs`·`cache` 주입. 같은 날짜 재방문 캐시 히트·outOfHorizon
   컷오프 결정성.

## 기대 커버리지(Standard)

- 핵심 계산 모듈(u1/u2/u3)은 80% 라인 커버리지 플로어 대상(team.md Q4).
  경로 한정 측정: `--coverage.include='src/<unit>/**'`.
- u4(UI)는 플로어 비대상 — 순수 로직(조립·상태/표시/차트 구성 매핑)에 테스트
  집중, 실제 렌더링은 수동 스모크.

## 테스트 데이터·환경

- 외부 날씨 API는 통합 테스트에서도 호출하지 않는다(U2 경계, 전부 mock/고정 객체).
- 고정 기준일·고정 좌표(서울 대표 좌표)로 결정성 확보.
- 경계 케이스: 월출/월몰·완전한 밤 null, 날씨 known/unknown/outOfHorizon, 천문 throw.

## 수동 스모크(렌더링·통합 UI — 자동 테스트 비대상)

`npx vite build` 또는 `npx vite`(dev)로 브라우저에서 1회 확인:
- 메인 목록이 카드 형태로 보이고 추천 카드가 노란 테두리+별 아이콘+"추천" 라벨로 강조.
- 상세 화면 차트가 보이고(고정 높이), 달 체감 밝기 시간별 곡선·구름량 곡선·박명
  음영 밴드(시민/항해/천문/완전한 밤 구분)·월출몰·일몰일출 세로선·KST HH:MM x축이 렌더.
- 월출/월몰/완전한 밤 null → 요약에 "-"(라벨은 "월몰" 등)로 표시, 중복 없음.
- 다크 배경 대비·모바일 세로 레이아웃·뒤로가기/재시도 버튼 식별 가능.
