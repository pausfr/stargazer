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
//  scales: { x:{type:'time' 또는 category},
//            yMoon:{position:'left', min:0, max:100},
//            yCloud:{position:'right', min:0, max:100} }
//  datasets:
//    - 달 밝기: astro.moonIlluminationPct는 단일 스칼라(시계열 아님, §2.1).
//      x축 양 끝 두 점에 같은 y값을 찍어 밤 전 구간 "수평 기준선"으로 표시, yAxisID:'yMoon'.
//      (시간별 달 밝기 곡선은 C1 계약에 없음 → 범위 밖)
//    - 구름량: cloud.status==='known' 일 때만 cloud.hourlyCloudPct 시계열, yAxisID:'yCloud'.
//      그 외 상태는 구름 데이터셋·우축 숨김.
//  plugins.annotation.annotations (null이면 해당 box 생략):
//    civilTwilight.start~end box, nauticalTwilight.start~end box, astronomicalTwilight.start~end box
//      — 각 box는 start 또는 end가 null이면 그리지 않음(해당 박명 미성립).
//    fullDark box: fullDarkStart~fullDarkEnd — 둘 중 하나라도 null이면 그리지 않음.
```
- 달 밝기는 **수평 기준선**("그날 밤 대표 조도")으로 표기하고 범례·축 설명에 명시. 시간축 곡선 아님.
- `cloud.status!=='known'`이면 구름 데이터셋·우축을 숨기고 달 밝기 기준선·박명만 표시.
- 박명/완전한 밤 음영은 위 null 규칙으로 안전하게 생략 처리(예: 서울 하지 무렵 천문박명 미성립).
- 다크 배경 대비를 위해 축/그리드/폰트 색 지정.

### NightSummary (props: `astro: AstronomyResult`)
- 완전한 밤: `fullDarkStart`~`fullDarkEnd`(둘 중 null이면 "없음" 처리).
- 월출/월몰: `moonrise`/`moonset`가 `null`이면 각각 "월출 없음"/"월몰 없음"(AC3.2.3).

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
