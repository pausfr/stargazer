# Design System Mapping — 별 보기 좋은 날 추천 앱

> 개인 앱이라 기성 디자인 시스템은 없다. 가벼운 자체 토큰·컴포넌트 세트를 정의하고, 코드 스타일은 team.md(Prettier+ESLint, 다크모드 접근성 관례)를 따른다.

## 디자인 토큰 (방향)

| 토큰 | 용도 | 방향 값(예시, 구현에서 확정) |
|------|------|------------------------------|
| color.bg | 배경 | 깊은 남색~검정 (#0b1020 계열) |
| color.surface | 카드 표면 | 배경보다 약간 밝은 남색 |
| color.text | 본문 | 저채도 밝은 회색 |
| color.accent | 추천·CTA 강조 | 노란색 (#f5c542 계열) |
| color.moonLine | 달 밝기선 | 밝은 톤(실선) |
| color.cloudLine | 구름량선 | 보조 톤(점선) |
| space.scale | 간격 | 4/8/16/24px |
| radius.card | 카드 모서리 | 중간 라운드 |
| touch.min | 터치 타깃 최소 | 44x44px |

색 값은 대비 기준(가독)과 다크모드를 만족하도록 구현 단계에서 확정한다. [Q1] [Q5]

## 컴포넌트 세트

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| AppHeader | 상단 제목/뒤로가기 | h1(메인)/h2(상세) |
| HolidayCard | 연휴/주말 카드 | 추천 강조 변형 포함 |
| MoonPhaseIcon | 달 위상 아이콘 | 조도 라벨 동반 |
| WeatherIcon | 구름 요약 아이콘 | 예보 있는 날만 |
| RecommendBadge | 추천 배지 | 노란 테두리+별+라벨(메인 한정) |
| NightDetailGraph | 상세 이중축 그래프 | 달 실선/구름 점선+박명 음영 |
| SummaryStats | 완전한 밤·월출몰 요약 | 숫자 텍스트 |
| Legend | 그래프 범례 | 색 비의존 설명 |
| StateView | 로딩/빈/에러/부분 표시 | 공통 상태 |

## 코드 스타일 정합

- Prettier + ESLint 표준(team.md Code Style). 다크모드에서 색만으로 정보를 전달하지 않는 관례를 컴포넌트 수준에서 지킨다. [team.md]

## Assumptions & Open Questions

None.
