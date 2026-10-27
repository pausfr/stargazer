# Performance Requirements — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: requirements.md(NFR3), functional-spec.md(§3 WF1·§4 WF2·§5.1 캐시), contract-summary.md(C1 동기·C2 Promise), nfr-requirements-questions.md(Q2·Q3). 상위 NFR ID에 서브넘버를 붙여 추적.
> u4는 표시 전용 UI 단위다. 성능 요구의 초점은 "체감 로딩"이며, 상위 NFR3가 엄격한 정량 목표를 두지 않으므로 정책·수단을 명시하고 측정은 수동 스모크로 한다.

## 성능 요구

| ID | 요구 | 근거 | 측정/판정 |
|----|------|------|-----------|
| NFR3.1 | 메인 목록(WF1) 진입 즉시 스켈레톤 카드로 로딩 상태를 표시해 첫 화면 체감 지연을 없앤다. 데이터가 도착하기 전에도 빈 화면을 보이지 않는다. | NFR3, AC1.1.3, functional-spec §3-1 | 진입 직후 스켈레톤이 그려짐(수동 스모크·UI 상태 단위 확인). |
| NFR3.2 | 날짜별 U2 `getCloudForecast`(Promise) 호출을 병렬(`Promise.all`)로 모아 전체 목록의 날씨 대기 시간을 직렬 합이 아닌 최대 지연으로 줄인다. | NFR3, functional-spec §3-5 | 목록 조립이 날짜 수에 비례해 직렬 지연되지 않음(코드 리뷰: 병렬 호출). |
| NFR3.3 | 천문 계산(U1 `computeAstronomy`, 동기)은 날씨 응답을 기다리지 않고 먼저 그릴 수 있어야 한다. 달·박명·월출몰은 즉시, 구름량은 도착 시 채우는 점진 표시로 체감 로딩을 단축한다. | NFR3, FR6.1(부분 상태), functional-spec §5 상태머신 | 날씨 지연·실패 시에도 천문 정보가 먼저/계속 표시됨(partial 상태 확인). |
| NFR3.4 | 공유 `DataCache` 인스턴스(App 루트 단일 보유, 모든 `getCloudForecast` 호출에 주입)로 같은 날짜 재방문 시 네트워크 재요청 없이 캐시 히트해 재표시 지연과 무료 한도 소모를 함께 줄인다. | NFR3, NFR4, AC4.1.2, functional-spec §5.1 | 같은 날짜 재진입 시 재요청 없음(캐시 주입 경로 코드 리뷰·스모크). |
| NFR3.5 | 상세 그래프(WF2)는 좌y축 달 체감 밝기 시간별 꺾은선(moonHourly, 밤 범위 약 30분 간격 샘플링 ≈ 20~30 포인트)과 우y축 구름량 시계열(시간별 약 12~15 포인트)의 **두 시계열**을 그린다. 총 데이터량이 여전히 작으므로 추가 가상화·다운샘플링 없이 단일 차트 인스턴스로 렌더한다. 재시도(WF3)·날짜 재방문은 공유 캐시 재조립으로 비용을 최소화한다. | NFR3, Q3, functional-spec §2.1·§4·§6 | 상세 진입이 흔한 모바일 환경에서 수 초 내 그려짐(수동 스모크). |

## 성능 정책 메모

- **정량 목표 미설정**: NFR3가 "몇 초 내"의 느슨한 기준만 두므로(Q2·Q3), 엄격한 ms/p75 TTI 목표는 두지 않는다. 가벼운 개인용 정적 앱의 비용 대비 가치 판단이다. 필요해지면 후속 버전에서 정량 목표와 측정 수단을 도입한다.
- **측정 방식**: 흔한 모바일 네트워크(throttling 포함)에서의 수동 스모크로 "목록·상세가 수 초 내 표시"를 확인한다. 자동 성능 테스트는 이 단위의 테스트 플로어(핵심 계산 모듈 집중)에 포함하지 않는다.
- **외부 의존 지연의 격리**: 느린/실패하는 날씨 API가 천문 표시를 막지 않도록(NFR3.3) 조립 순서를 고정한다 — 이는 성능이자 가용성(FR6.1 partial) 정책이다.

## Sources

- NFR3 (requirements.md): 흔한 모바일 네트워크에서 메인 목록이 몇 초 내 표시, 엄격한 정량 목표 없음.
- NFR4, AC4.1.2 (requirements.md/stories): 온라인 전제 + 짧은 캐시.
- functional-spec.md §3(WF1), §4(WF2), §5.1(공유 캐시 소유·주입), §6(WF3): 조립 순서·병렬화·캐시 주입·렌더 정책.
- contract-summary.md C1·C2: U1 동기 계산, U2 Promise 반환(예외 없이 status).
- nfr-requirements-questions.md Q2·Q3: 체감 로딩/렌더 성능 정책 확정.

## Assumptions & Open Questions

None.
