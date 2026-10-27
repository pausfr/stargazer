# Performance Design — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: nfr-requirements(performance-requirements NFR3.1~3.5·tech-stack-decisions Chart.js), functional-spec(§2 조립·§3 WF1·§4 WF2·§5.1 캐시·§6 WF3), contract-summary(C1 동기·C2 Promise·C3 동기), nfr-design-questions.md(Q1·Q2). 설계 수준(패턴)만; 구현 코드는 code-generation.
> u4는 표시 전용 UI 단위다. 성능 설계의 초점은 "체감 로딩"이며, 느린/실패하는 외부 날씨를 천문 표시와 분리해 점진 렌더하는 조립·렌더 패턴이다. 정량 목표는 두지 않고 수동 스모크로 확인(NFR3 정책).

## 성능 설계 결정

### PD1. 점진 렌더 조립 패턴 (NFR3.1, NFR3.3)
- **패턴**: NightViewAssembler가 날짜별로 두 단계로 결과를 낸다.
  1. **즉시 단계** — U1 `computeAstronomy`(동기)와 U3 `listCandidateDates`(동기)로 달·박명·월출몰·카드 골격을 먼저 산출해 렌더한다. 날씨를 기다리지 않는다.
  2. **지연 단계** — U2 `getCloudForecast`(Promise)가 도착하면 구름 부분과 `recommend` 판정을 채워 갱신한다.
- 진입 즉시 스켈레톤 카드(AC1.1.3)를 그려 빈 화면을 없앤다(NFR3.1).
- **근거**: 느린 날씨가 핵심(천문) 표시를 막지 않게 하는 조립 순서 고정. functional-spec §3-5·§5 상태머신과 정합.

### PD2. 병렬 수집 (NFR3.2)
- **패턴**: WF1의 날짜별 U2 호출을 `Promise.all`로 병렬 수집한다. 목록 전체의 날씨 대기 시간이 날짜 수 × 단건 지연의 직렬 합이 아니라 최대 단건 지연에 수렴한다.
- 부분 실패 격리: 한 날짜의 날씨 실패(`status=unknown`)가 다른 날짜 카드나 천문 표시를 막지 않는다(각 NightView 독립 상태).
- **근거**: NFR3.2, functional-spec §3-5.

### PD3. 공유 캐시 재히트 (NFR3.4, AC4.1.2)
- **패턴**: AppRoot가 `DataCache` 단일 인스턴스와 기준 시각 `nowMs`를 보유하고, WF1 목록·WF2 상세·WF3 재시도의 **모든** `getCloudForecast` 호출에 `options.cache`로 주입한다. 같은 날짜 재방문·재시도는 네트워크 재요청 없이 캐시 히트한다.
- `nowMs` 주입으로 outOfHorizon 컷오프·TTL 판정을 결정적으로 만들어 재조립 결과의 일관성을 확보한다.
- **근거**: NFR3.4, NFR4, functional-spec §5.1. 저장·TTL 정책 자체는 U2(DataCache) 소유.

### PD4. 상세 차트 단일 인스턴스 (NFR3.5)
- **패턴**: NightDetailView는 Chart.js 인스턴스를 날짜마다 destroy/재생성하지 않고 **하나를 유지하며 data만 갱신**한다. 상세 그래프는 좌y축 달 체감 밝기 시간별 꺾은선(moonHourly, 밤 범위 약 30분 간격 ≈ 20~30 포인트)과 우y축 구름량 시계열(시간별 약 12~15 포인트)의 두 시계열을 그리지만, 총 데이터량이 여전히 작으므로 가상화·다운샘플링을 두지 않는다.
- 박명 음영(annotation box)·월출몰 요약은 data 갱신과 함께 재계산해 반영한다.
- **근거**: NFR3.5, Q2, functional-spec §2.1·§4.

## 성능 예산·측정

- **정량 목표 미설정**: NFR3가 "몇 초 내"의 느슨한 기준만 두므로 엄격한 ms/TTI 목표는 두지 않는다(가벼운 개인용 정적 앱). 설계는 "체감 지연을 만드는 구조적 원인(직렬 대기·전체 재조립·빈 화면)을 제거"하는 데 집중한다.
- **측정**: 흔한 모바일 네트워크(throttling 포함) 수동 스모크로 목록·상세가 수 초 내 표시되는지 확인한다. 자동 성능 테스트는 이 단위의 테스트 플로어에 포함하지 않는다(핵심 계산 모듈 집중 원칙).

## 짧은 설계 스케치 (≤15줄, 구현 아님)

```text
// AppRoot: 공유 캐시·기준 시각 단일 보유
cache = new DataCache(); nowMs = Date.now()

// NightViewAssembler.assemble(dateKstId): 점진 2단계
astro = computeAstronomy({ dateKstId, lat, lon, nightStartKst, nightEndKst })  // 즉시
emit({ astro, state: 'loading-weather' })                                      // 골격 먼저
cloud = await getCloudForecast({ dateKstId, lat, lon }, { nowMs, cache })      // 지연
verdict = recommend(astro, cloud)
emit({ astro, cloud, verdict, state: mapState(astro, cloud) })                 // 갱신
// WF1: dates.map(assemble) 를 Promise.all 로 병렬
```

## Sources

- performance-requirements.md(NFR3.1~NFR3.5), tech-stack-decisions.md(Chart.js), functional-spec.md(§2·§3·§4·§5.1·§6), contract-summary.md(C1·C2·C3), nfr-design-questions.md(Q1·Q2).

## Assumptions & Open Questions

- 구체 렌더 프레임워크·차트 data 갱신 API 형태와 스켈레톤 UI 구현은 code-generation에서 확정한다. [assumption]
