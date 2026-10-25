# Interaction Specification — 별 보기 좋은 날 추천 앱

> component-spec-template.md 형식. 모바일·터치 우선. 근거: mockups.md, stories.md.

## HolidayCard (연휴/주말 카드)

| Field | Value |
|---|---|
| Component | HolidayCard |
| Description | 메인 목록의 한 날짜(주말/연휴) 카드 |
| Category | display / navigation |

### States

| State | Description | Trigger |
|---|---|---|
| default | 일반 카드 | 렌더 |
| recommended | 추천 날(노란 테두리+별+라벨) | 추천 판정 통과 |
| pressed | 탭 피드백 | touchstart |
| partial | 먼 날: 날씨 자리 "가까워지면 표시" | 구름 예보 없음 |
| error | 날씨 실패: 날씨 자리 "불러오기 실패" | 날씨 API 실패 |

### Interaction

- 탭하면 상세 화면으로 이동(터치 타깃 전체 카드, 높이 ≥ 44px). 탭 시 짧은 눌림 피드백(<300ms).
- 색만으로 추천을 전달하지 않음: 노란 테두리 + 별 아이콘 + "추천" 텍스트 병행.

### Responsive

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | 단일 열, 카드 꽉 찬 너비 |
| desktop (>=1024px) | 중앙 최대폭 컨테이너, 카드 폭 제한 |

## NightDetailGraph (상세 이중축 그래프)

| Field | Value |
|---|---|
| Component | NightDetailGraph |
| Description | 선택한 밤의 달 밝기·구름량·박명 이중축 그래프 |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| loading | 스켈레톤 그래프 영역 | 데이터 대기 |
| full | 달+구름+박명+월출몰 모두 | 예보 있는 날, 모두 성공 |
| no-weather | 구름 곡선 없이 달·박명, "날씨는 날짜가 가까워지면" 안내 | 먼 날(예보 지평 밖, FR5.2) |
| weather-failed | 구름 곡선 자리에 "불러오기 실패" + 재시도, 달·박명·월출몰은 유지 | 가까운 날인데 날씨 API 호출 실패(부분, FR6.1/AC4.1.1) |
| error | 천문 계산 실패: 그래프 대신 에러 + 재시도 | 천문 계산 실패 |

no-weather(먼 날, 애초에 예보가 없음)와 weather-failed(가까운 날, 예보는 있으나 호출 실패)는 문구로 명확히 구분한다. 전자는 "가까워지면 표시", 후자는 "불러오기 실패 + 재시도".

### Interaction

- x=시간축(저녁~새벽), 좌y=달 밝기(0~100%), 우y=구름량(0~100%).
- 달=실선, 구름=점선 + 색 + 범례(색 비의존). [Q2]
- 박명 구간 음영, "완전한 밤"은 진한 음영. 월출/월몰·완전한 밤 시각은 상단 숫자 요약.
- 그래프는 비시각 사용자를 위해 핵심 숫자 요약(완전한 밤 구간, 월출·월몰)을 텍스트로도 제공.

### SummaryStats 표기

- 완전한 밤 구간(시작~끝)과 월출·월몰 시각을 숫자로 표시.
- 그날 밤에 월출 또는 월몰이 없으면(달이 밤새 떠 있거나 아예 뜨지 않음) 해당 시각을 "없음"(월출 없음 / 월몰 없음)으로 구분 표기. (AC3.2.3)

## BackControl (뒤로가기)

| Field | Value |
|---|---|
| Component | BackControl |
| Category | navigation |

### Interaction

- 상세 → 메인 복귀(이전 스크롤 위치 보존). 터치 타깃 ≥ 44x44px. 브라우저 뒤로가기와도 일치.
- 이전/다음 연휴 바로 이동 컨트롤 없음(MVP 제외). [FR3.6]

## 공통 상태 패턴

- 로딩=스켈레톤, 에러=문구+재시도, 부분=명확히 구분(먼 날 날씨/날씨 실패). 색 외 아이콘·텍스트 병행.
- 재시도 성공 시 상태 전이: error(또는 weather-failed) → loading → full(성공). 재시도가 또 실패하면 같은 실패 상태를 유지한다. (AC4.2.2)

## Assumptions & Open Questions

None.
