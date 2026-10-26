# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER 클라이언트 번들에 API 키나 그 밖의 시크릿을 하드코딩한다. (affirmed 2026-10-25)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS 모든 런타임 데이터 소스(무료 날씨 API 티어, 오픈소스 천문 계산)를 (affirmed 2026-10-25)

무료 티어 범위 안에서만 사용한다. (affirmed 2026-10-25)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- 이 앱의 핵심 가치는 특정 천문 이벤트(은하수·행성·유성우·별자리) 비교가 아니라 "달 위상 + 구름 양 + 박명(완전한 밤 구간) 그래프"로 좋은 관측 밤을 고르는 것이다; 전자는 열린 항목으로만 둔다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:intent-capture:a44f6c577e16e57ba1c9496ce26e9eb13113ea0d82dc7de943cebcbf3653d990 -->
- 관측 위치의 개념 모델은 개별 명소가 아니라 박명 시각이 유의미하게 달라지는 한국 ~5개 지역 구획이다(시골 관측 전제). 단, 첫 버전(MVP)에서는 지역 구획을 쓰지 않고 전국 대표 좌표 하나로 시작하며, 구획 선택/비교는 다음 버전으로 이월한다(아래 scope-definition 학습 참조). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:intent-capture:1c9e88dc886bcf59cdade28471613b74e2a590cac3a85d9fa79980c8bc8e4034 -->
- 데이터 확보의 잠정 기술 방향은 "달 위상·박명은 오픈소스 천문 계산 라이브러리로 직접 계산, 구름량은 무료 티어 날씨 API(Open-Meteo류)"이다(비용 전부 무료 범위 우선). 최종 선택은 Feasibility/설계에서 확정. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:market-research:b92a8e3519236caae9ca2860e1d1085ebdaf0c09f25ced85aeee84f848b7f617 -->
- 날씨 예보 지평이 짧으므로(무료 API 보통 ~2주), 가까운 날짜는 구름량까지 표시하고 먼 날짜(3개월 범위)는 달 위상·박명만 확정으로 보여주며 날씨는 날짜가 가까워지면 채운다. 이것이 "3개월 연휴 비교"를 성립시키는 핵심 설계 전제다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:feasibility:5a0c481bfe7eda1c31b99aff25d50b23438dae57e34e732b1324b21caba3306e -->
- 달 밝기는 조도(illuminated fraction 0~100%)로 표현하고, 데이터 갱신은 앱을 열 때 fetch한 뒤 짧게 캐시해 무료 한도를 보호한다(잠정, 설계에서 확정). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:feasibility:426b8cc22e8d82d6a9191ad73aea70ce9fcd1e2d6d944ffa01580cdcdc862362 -->
- 첫 버전(MVP)은 전국 대표 좌표 하나로 계산하며, 한국 ~5개 지역 구획 선택/비교는 첫 버전에서 제외하고 다음 버전 목표로 이월한다(intent-capture의 5구획 확정을 번복·이월). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:scope-definition:b493aa21db39f88c202e0ab7963aea6f1c607e420f510c847ce0aec7d8972c53 -->
- 월출·월몰 시각은 관측에 중요하므로 상세 그래프의 MVP 필수 요소다(달 밝기 곡선 + 구름량 곡선 + 박명 음영/완전한 밤 + 월출·월몰). (learned 2026-10-25) <!-- cid:261025-stargazing-planner:scope-definition:6bf4a208c5ff0f827706eac21db1123ec9275992f46ef15f858c869cabe85edd -->
- 기본 테마는 다크모드다(밤 관측 준비 맥락). 메인 카드의 "관측 좋은 날"(달 어두운 밤) 강조는 노란색 테두리로 하되, 색만으로 전달하지 않도록 아이콘/라벨을 병행한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:rough-mockups:37bbb94c05f6487bbcb3aa8e3f585fb4a0d598d0662e9a49f66021da95124034 -->
- 상세 화면의 이전/다음 연휴 바로 이동 네비게이션은 MVP에서 제외하고 뒤로가기로만 날짜를 바꾼다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:rough-mockups:9a1a72b3b39cd97576bd636493c7e5eb93ce219e690a0c501444af295217146e -->
- 워킹 스켈레톤 스탠스는 활성 스코프 기본값에 맡긴다(하드 on/off 아님). 테스트 커버리지 80% 플로어는 핵심 천문 계산 모듈에만 적용하고 UI 등 나머지는 느슨하게 둔다. 테스트 방법론은 test-after. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:practices-discovery:37da8e6bc63d28027d7c9fdd6eb33a31f44a74b9b4453f3d153fad8305caf93e -->
- 정적 앱이라 API 키를 숨길 서버가 없다. 따라서 키가 필요 없는 공개 API(Open-Meteo 등)를 우선 선택하고, 키가 꼭 필요하면 설계 단계에서 프록시를 둘지 여부를 결정한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:practices-discovery:22bef133ed0c0265caf830e69758205b50c190b729a59b993d9dc8f4f622cfb0 -->
- "추천(관측 좋은 날)" 판정은 달 위상만이 아니라 달 조도가 낮고(어두운 밤) 구름도 적을 때 성립한다(구름 많으면 추천 제외). 구름 예보 데이터가 없는 날은 달 조도만으로 판정한다. 잠정 임계값은 달 조도 ≤ 20%, 구름량 ≤ 30%이며 설계에서 조정 가능. 이는 앞선 "추천=달 위상만" 노트를 대체한다. (learned 2026-10-25) <!-- cid:261025-stargazing-planner:requirements-analysis:edcdc6a783228340278a991bf4507970021a713972a7f6828958bf10ee2eae4a -->
- 단위 분해는 관심사(레이어)별 굵은 4단위로 한다: 천문 계산(library), 날씨+캐시(library), 달력+추천 규칙(library), UI 화면(ui). 1인·무료 정적 앱에서는 화면별 묶기나 컴포넌트 1:1 분해보다 레이어 분리가 변경률 경계와 핵심 계산 모듈 테스트 집중에 더 맞다. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:units-generation:aceaa2fe9f4c8b22946d7bd8ade515121f57e0967336dab3b4a2f013913fa21d -->
- 단위별로 "핵심 체크포인트만 자동 진행"을 요청하면, 엔진 autonomy 스위치(전역)를 켜지 않고 조정자가 그 단위의 설계 리뷰 게이트만 자동으로 넘기되 요약 확인·코드 생성 계획 승인·검증 명령·단위 완료 검증 같은 핵심 체크포인트는 그대로 사람에게 받는다. 리뷰어·센서는 계속 돈다. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:nfr-design:9068c79566f6179265c5ae95c043f6a02c3bc0bac83734ebf3c555438b84337b -->
- 유닛 테스트 커버리지 플로어는 `--coverage.include='src/<unit>/**'`로 경로를 한정해 측정한다(루트 v8 커버리지가 리포지토리 전체, .kiro 툴링 포함을 집계해 핵심 모듈 플로어를 희석하는 문제 회피). 기능·테스트 범위는 동일, 측정 방식만 명시. (learned 2026-10-26) <!-- cid:261025-stargazing-planner:code-generation:d6f1282123d03a233fc283a5548656daf73df42562c62cad330d31fabf002175 -->
