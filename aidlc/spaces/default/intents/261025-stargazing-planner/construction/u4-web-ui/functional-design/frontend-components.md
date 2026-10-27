# Frontend Components — u4-web-ui

> 다크모드 모바일 우선, Vanilla TypeScript + Vite(프레임워크 없음). 상태는 명시적 뷰모델과
> 간단한 라우팅으로 관리. 그래프는 Chart.js 4 + chartjs-plugin-annotation 3.
> 소유 엔티티 없음 — 상위 계약(C1·C2·C3) 결과를 조립해 표시만 한다.
> 이 문서는 구현 지침(계층·props/state·상호작용·에러 처리)이며, 완성 코드는 code-generation에서.

## 1. 기술 선택 요약

| 항목 | 결정 | 근거 |
|------|------|------|
| 언어/빌드 | TypeScript + Vite | 화면 2개뿐, 프레임워크 오버헤드 불필요. 정적 번들 진입점(NFR7) |
| 프레임워크 | 없음(Vanilla) | Q1=A. 경량 번들. DOM 직접 조작 + 작은 렌더 함수 |
| 그래프 | Chart.js 4 + chartjs-plugin-annotation 3 | Q2=A. 이중축 + 박명/완전한 밤 음영(box annotation) 선언적 지원 |
| 라우팅 | 해시 기반 경량 라우터(`#/` 목록, `#/night/:dateKstId` 상세) | 정적 호스팅에서 서버 설정 불필요, 뒤로가기 자연 지원(AC3.3.1) |
| 테마 | 다크모드 기본(CSS 변수) | 메모리 학습·NFR1 |

> 비밀값·API 키 하드코딩 금지(project.md Forbidden). U2가 키 불필요 공개 API를 쓰므로 UI에 키 없음.

## 2. 컴포넌트 계층

```text
App (루트: 라우터 + 테마 + 전역 좌표 상수)
├── Router (해시 라우팅: list | detail)
├── HolidayListView (화면 1: 메인 목록)   #/
│   ├── ListLoadingSkeleton      (loading)
│   ├── EmptyState               ("표시할 날짜가 없어요")
│   └── NightCard[]              (각 후보 날짜 1장)
│       ├── MoonPhaseIcon        (달 위상 아이콘 + 조도%)
│       ├── CloudSummary         (known: 요약 / outOfHorizon: 안내 / unknown: "알 수 없음")
│       └── RecommendBadge       (recommended일 때만: 노란 테두리 + 별 + "추천")
└── NightDetailView (화면 2: 상세 그래프)  #/night/:dateKstId
    ├── DetailLoadingSkeleton    (loading)
    ├── ErrorRetry               (천문 실패: 메시지 + "다시 시도")
    ├── DualAxisChart            (Chart.js 이중축 + 박명/완전한 밤 음영)
    ├── NightSummary             (완전한 밤 시작·끝, 월출·월몰 / null="없음")
    ├── ChartLegend              (선·음영 의미 설명)
    └── FarDateNotice            (outOfHorizon: "날씨는 날짜가 가까워지면")
```

## 3. 공유 타입 / 뷰모델 (UI 내부, 표시 전용)

```ts
// 상위 계약에서 import (재구현 금지): C1 AstronomyResult·AstronomyInput·AstronomyComputationError,
// C2 CloudForecast·CloudForecastQuery·CloudStatus·DataCache, C3 CalendarDate·Recommendation.
type ViewState = 'loading' | 'ok' | 'partial' | 'error';

interface NightView {
  dateKstId: string;
  calendar: CalendarDate;              // U3
  astro: AstronomyResult | null;       // U1, 실패 시 null + astroError
  astroError: boolean;                 // AstronomyComputationError 발생 여부
  cloud: CloudForecast;                // U2 (status로 known/outOfHorizon/unknown)
  verdict: Recommendation | null;      // U3 recommend (상세에선 불요)
  state: ViewState;
}

const DEFAULT_LOCATION = { lat: 37.5665, lon: 126.9780 } as const; // 서울(Q4=A)

// 공유 캐시: App 루트에서 단 하나 생성, 모든 getCloudForecast 호출에 주입(§5.1 spec).
// getCloudForecast(query, { nowMs, cache })의 cache 미주입 시 호출마다 새 캐시 → 재사용 0.
const sharedWeatherCache = new DataCache();
```

상태 파생 규칙(§functional-spec §5와 일치):
- `astroError` → `state='error'`
- `cloud.status==='unknown'` → `state='partial'`
- 그 외(`known` | `outOfHorizon`) → `state='ok'`

## 4. 컴포넌트별 props / 상호작용

### HolidayListView
- **입력**: 없음(진입 시 스스로 fetch). 좌표는 `DEFAULT_LOCATION`, 캐시는 `sharedWeatherCache`.
- **동작**: `range={fromKstId: todayKst(), months:3}` → `listCandidateDates` → 각 날짜 NightView 조립(§2.1):
  - `computeAstronomy({ dateKstId, lat, lon, nightStartKst: calendar.nightStartKst, nightEndKst: calendar.nightEndKst })` — 밤 범위 전달로 x축·음영·월출몰 정렬.
  - `getCloudForecast({ dateKstId, lat, lon }, { nowMs: Date.now(), cache: sharedWeatherCache })` — 공유 캐시 주입. U2는 `Promise.all` 병렬.
  - 조립 전 스켈레톤.
- **빈 목록**: 결과 0건 → `EmptyState`.
- **카드 탭**: `location.hash = '#/night/' + dateKstId`.

### NightCard (props: `night: NightView`)
- 날짜/연휴명(`calendar.label`), `MoonPhaseIcon(astro.moonIlluminationPct)`, `CloudSummary(cloud)`.
- `night.verdict?.verdict==='recommended'` → `RecommendBadge` 표시(노란 테두리 class + 별 아이콘 + "추천" 텍스트). **색만으로 전달 금지**(아이콘·라벨 필수, NFR1).
- `state==='partial'` → 구름 영역만 "구름량 알 수 없음".
- `state==='error'` → 카드 내 축약 에러 + 재시도(상세와 동일 WF3).

### CloudSummary (props: `cloud: CloudForecast`)
- `known`: 시간대 평균/대표 구름량 요약 텍스트.
- `outOfHorizon`: "날씨는 날짜가 가까워지면 표시".
- `unknown`: "구름량 알 수 없음"(중립, 실패 비난 아님).

### NightDetailView (props: `dateKstId: string`)
- 진입 시 NightView 조립(§2.1: computeAstronomy에 `nightStartKst`/`nightEndKst` 전달, getCloudForecast에 `{ nowMs, cache: sharedWeatherCache }` 주입). `astroError` → `ErrorRetry`만 렌더.
- 정상: `DualAxisChart` + `NightSummary` + `ChartLegend`, `outOfHorizon`이면 `FarDateNotice`.
- 뒤로가기: 브라우저 history 사용(AC3.3.1). 이전/다음 연휴 버튼 **없음**(AC3.3.2).

### DualAxisChart (props: `astro: AstronomyResult`, `cloud: CloudForecast`)
```ts
// Chart.js 구성 개요(완성 코드는 code-generation):
//  type: 'line'
//  scales: { x:{type:'linear'(epoch ms), ticks.callback로 KST HH:MM 포맷},
//            yMoon:{position:'left', min:0, max:100},
//            yCloud:{position:'right', min:0, max:100} }
//  datasets:
//    - 달 체감 밝기: astro.moonHourly[] 시간별 꺾은선(월출 ~0 → 남중 피크 → 월몰 ~0, §2.1 갱신).
//      각 점 { x: Date.parse(hourKst), y: relativeBrightnessPct }, yAxisID:'yMoon'. 수평 기준선 아님.
//      (위상값 moonIlluminationPct는 곡선이 아니라 NightSummary의 "달 밝기(위상)"로 표기)
//    - 구름량: cloud.status==='known' 일 때만 cloud.hourlyCloudPct 시계열, yAxisID:'yCloud'.
//      그 외 상태는 구름 데이터셋·우축 숨김.
//  x축 눈금: ticks.callback(ms) → KST "HH:MM"(계산 epoch와 표시 분리; epoch 원본값 노출 금지).
//  plugins.annotation.annotations (null이면 해당 box 생략) — 어두워지는 순 농도 차등 + box 내부 라벨:
//    civilTwilight box(옅은 음영, 라벨 "시민"), nauticalTwilight box(중간 음영, 라벨 "항해"),
//    astronomicalTwilight box(진한 음영, 라벨 "천문"), fullDark box(가장 진한 음영, 라벨 "완전한 밤").
//      — 각 box는 start 또는 end가 null이면 그리지 않음. 겹침은 안쪽(더 어두운) 음영이 이기도록 레이어링.
```
- 달 밝기는 **시간별 체감 밝기 꺾은선**(moonHourly)으로 그린다. 밤새 달 고도에 따른 대기소광×입사각×위상으로 월출/월몰 근처가 낮고 남중 근처가 높다. 수평 기준선 아님(§2.1 갱신).
- x축은 epoch ms로 계산하되 눈금은 KST HH:MM로 포맷해 표시한다(원본 ms 노출 금지).
- 박명 음영은 시민<항해<천문<완전한 밤 순으로 농도를 높이고, 각 box 안에 라벨 텍스트를 넣어 가시성을 확보한다. 겹침은 안쪽 음영 우선.
- `cloud.status!=='known'`이면 구름 데이터셋·우축을 숨기고 달 밝기 곡선·박명만 표시.
- 박명/완전한 밤 음영은 위 null 규칙으로 안전하게 생략 처리(예: 서울 하지 무렵 천문박명 미성립).
- 다크 배경 대비를 위해 축/그리드/폰트 색 지정.

### NightSummary (props: `astro: AstronomyResult`)
- 달 밝기(위상): `moonIlluminationPct`를 "달 밝기" 행으로 표기(곡선과 별개의 위상 지표).
- 완전한 밤: `fullDarkStart`~`fullDarkEnd`(둘 중 null이면 값 "없음"; 라벨 "완전한 밤").
- 월출/월몰: `moonrise`/`moonset`가 `null`이면 **값만 "없음"**(라벨 "월출"/"월몰"이 맥락 제공). 라벨과 값에 "월출"/"월몰"을 중복 출력하지 않는다(종전 "월몰 월몰 없음" 중복 보완, AC3.2.3).

## 5. 에러 / 로딩 처리 (통합)

| 상황 | 소스 신호 | UI 처리 | AC |
|------|-----------|---------|-----|
| 로딩 중 | 조립 전 | 스켈레톤(목록/상세) | AC1.1.3 |
| 정상 | astro OK, cloud known | 전체 표시 | AC4.1.3 |
| 날씨 실패 | cloud.status=unknown | 달·박명·월출몰 표시 + 구름만 "알 수 없음"(partial) | AC4.1.1, FR6.1 |
| 먼 날짜 | cloud.status=outOfHorizon | 구름 생략 + "가까워지면" 안내(ok) | AC1.3.3, AC3.1.3 |
| 천문 실패 | AstronomyComputationError | 에러 메시지 + "다시 시도"(error) | AC4.2.1 |
| 재시도 성공 | 재조립 성공 | ok/partial로 전이 | AC4.2.2 |

- 날씨 실패는 전체를 막지 않음(partial), 천문 실패만 화면/카드 차단(error). U2 무예외·U1 예외 계약과 일치.
- 캐시는 U2 소유(AC4.1.2); UI는 재방문 시 자연 활용.

## 5.5. 스타일링 명세 (필수 — 전용 스타일시트)

> 리뷰에서 발견된 누락 보완(2026-10-27): 앞선 구현이 컴포넌트 className만 붙이고 대응 CSS를 작성하지 않아 화면이 맨 텍스트로 렌더됐다. 이 절은 **전용 스타일시트가 필수 산출물**임을 설계로 못박는다. className과 그 스타일 규칙은 한 쌍으로 함께 존재해야 한다(code completeness).

- **스타일시트 파일**: `src/web-ui/styles.css`(전용 파일)를 신설하고 `src/main.ts`(또는 `index.html`)에서 import한다. index.html의 인라인 `<style>`은 CSS 변수(테마 토큰)와 `html/body/#app` 기본만 두고, **컴포넌트 스타일은 모두 `styles.css`**에 둔다. Vite가 번들에 포함한다.
- **테마 토큰 재사용**: index.html에 정의된 CSS 변수(`--bg`, `--surface`, `--surface-2`, `--text`, `--text-dim`, `--border`, `--accent`, `--accent-text`, `--danger`)를 사용한다. 다크모드 기본(NFR1).
- **클래스↔스타일 쌍 목록**(코드가 붙이는 className 전부에 규칙이 있어야 함):
  - `.card` — 메인 목록 카드: `--surface` 배경, `--border` 1px 테두리, 라운드(12px), 패딩, 카드 간 세로 간격, 탭 가능한 커서/누름 상태. 날짜·연휴명(제목), 달 아이콘+조도, 구름 요약을 한 카드 안에 정렬(모바일 세로: 세로 스택, 데스크톱: 여유 폭).
  - `.card.recommended` — 추천 강조: `--accent`(노란색) 2px 테두리 + 별 아이콘(형태) + "추천" 라벨(텍스트). **색 비의존**(NFR1·AC2.1.4): 테두리 색 외에 아이콘·라벨이 항상 함께 보이도록 한다.
  - `.badge-recommend` — "추천" 배지: `--accent` 배경·`--accent-text` 글자, 별 아이콘 포함.
  - `.moon-illum` / `.cloud-summary` — 달 조도·구름 요약 텍스트 스타일(보조 텍스트는 `--text-dim`).
  - `.skeleton` — 로딩 스켈레톤: `--surface-2` 블록 + 은은한 shimmer(prefers-reduced-motion 존중).
  - `.empty-state` — 빈 목록 안내 중앙 정렬 보조 텍스트.
  - `.detail` 영역 — 상세 화면 컨테이너.
  - `.chart-wrap`(또는 뷰가 쓰는 차트 컨테이너 클래스) — 차트 영역: 고정 높이(예: 320px)와 100% 폭을 **명시**(Chart.js canvas는 부모 크기에 의존하므로 높이를 안 주면 그래프가 안 보이거나 0 높이가 된다). 다크 배경 대비. 박명 음영은 시민<항해<천문<완전한 밤 순으로 농도를 높이고(색 농도/투명도 차등), 각 음영 영역 안의 라벨 텍스트는 다크 배경에서 읽히는 대비를 확보한다.
  - `.summary` / `.summary-row` — 핵심 숫자 요약(완전한 밤·월출·월몰) 라벨-값 행. "없음" 값도 동일 스타일로 표시(AC3.2.3).
  - `.legend` — 범례: 선·음영 의미를 색 견본 + 텍스트로(색 비의존).
  - `.notice` / `.notice-far` — partial "구름량 알 수 없음", outOfHorizon "날씨는 날짜가 가까워지면" 안내. 중립 톤(`--text-dim`), 에러 아님.
  - `.error` / `.btn-retry` — 천문 실패 에러 블록(`--danger` 강조 + 아이콘/텍스트)과 "다시 시도" 버튼(명확한 버튼 형태·누름 상태·충분한 탭 타깃 ≥44px).
  - `.btn-back` — 뒤로가기 버튼.
- **반응형**: 모바일 세로 우선(기본 1열), 데스크톱은 `#app`의 `max-width`(720px) 안에서 비파괴 확장(NFR2). 미디어쿼리로 카드 내부 정렬만 조정, 레이아웃 붕괴 없음.
- **접근성**: 탭 타깃 최소 크기, 포커스 가시성(`:focus-visible`), 다크 배경에서 본문/보조 텍스트 대비 확보, 색 비의존 강조(위 `.recommended`·`.legend`).
- **안전 렌더 유지(NFR6)**: 스타일은 class 토글로만 적용하고, 사용자 노출 문자열은 계속 `textContent`로 바인딩한다(innerHTML 금지). 스타일 추가가 이 규칙을 바꾸지 않는다.

이 절은 code-generation에서 `styles.css`를 실제로 작성하고 각 뷰가 위 className을 부여하도록 요구한다. 스타일시트 없는 산출물은 미완성으로 본다.

## 6. 접근성·반응형 체크리스트

- [ ] 추천 강조: 색(노란 테두리) + 형태(별 아이콘) + 텍스트("추천") 3중 (NFR1, AC2.1.4)
- [ ] 다크 배경에서 그래프 선/음영 대비 확보, 범례로 의미 보강
- [ ] 모바일 세로 우선, 데스크톱 비파괴(가로 확장 허용) (NFR2)
- [ ] "없음"·"알 수 없음"·"가까워지면" 같은 상태 문구를 색 아닌 텍스트로 구분

## 7. 테스트 메모 (team-practices)

- 커버리지 80% 플로어는 **핵심 계산 모듈(U1·U3)에만** 적용. U4(UI)는 더 느슨, 수동 스모크로 보완.
- 테스트 가치가 있는 순수 로직(상태 파생 `deriveViewState`, "그날 밤" 데이터 조립 매핑, 월출몰 null→"없음" 변환)은 단위 테스트 대상. Chart.js 렌더 자체는 수동 스모크.

## Assumptions & Open Questions

None.
