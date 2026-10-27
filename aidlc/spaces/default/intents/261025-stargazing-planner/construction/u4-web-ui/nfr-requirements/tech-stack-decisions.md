# Tech Stack Decisions — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). 근거: nfr-requirements-questions.md(Q1·Q2·Q3), functional-spec.md(§4 상세 그래프·Chart.js 가정), requirements.md(NFR1·NFR2·NFR5·NFR6·NFR7), team.md(Code Style). 구체 패키지·버전 확정은 code-generation.

## 기술 선택

| 영역 | 선택 | 근거 |
|------|------|------|
| 언어 | TypeScript | 팀 코드 스타일(Prettier+ESLint, camelCase), 브라우저 런타임, 상위 계약(C1·C2·C3) 타입과 정합 |
| 런타임 대상 | 브라우저(정적 번들) | ADR-001 백엔드 없는 정적 클라이언트 앱, NFR7 무료 정적 호스팅 |
| UI 구조 | 표시 전용 화면 2종(HolidayListView, NightDetailView) + App 루트 상태/공유 캐시 보유 | functional-spec §1·§5.1, 소유 엔티티 없음 |
| 차트 라이브러리 | Chart.js + chartjs-plugin-annotation | Q1 확정. 무료·오픈소스(MIT), 키 불필요, 브라우저 동작, 이중축(달 밝기 기준선/구름량 곡선)·annotation 음영(박명 3구간·완전한 밤) 지원, 다크 배경 색 지정 가능. functional-spec §4 가정과 정합 |
| 테마·접근성 | 다크모드 기본, 색 비의존 강조(노란 테두리 + 별 아이콘 + "추천" 라벨 병행) | NFR1, project.md 학습, functional-spec §3·§7 |
| 반응형 | 모바일 세로 우선, 데스크톱 비파괴(가로 확장) | NFR2, functional-spec §7 |
| 빌드·테스트 러너 | 프로젝트 공통 선택(code-generation 스캐폴딩에서 확정) | 전체 번들과 통일; u4 단독으로 결정하지 않음 |

## 차트 라이브러리 결정 근거 (Q1)

- **선택: Chart.js(+ chartjs-plugin-annotation)**. functional-spec §4가 Chart.js 이중축·annotation box를 전제로 상세 그래프 워크플로를 규정했고, 이를 확정한다.
- **요구 적합성**: (1) 이중축 — 좌y축 달 밝기 수평 기준선 + 우y축 구름량 시계열, (2) 배경 음영 — 시민/항해/천문 박명 3구간과 완전한 밤을 annotation box로, (3) null 경계 처리 — 해당 음영 box 미표시, (4) 다크 배경 대비 색·범례 지정. Chart.js + annotation 플러그인이 모두 커버한다.
- **제약 정합**: 무료·MIT 라이선스(NFR5), 키·네트워크 불필요(NFR6), 브라우저 번들 동작(NFR7).
- **대안(기각)**: uPlot/ECharts 또는 직접 SVG/Canvas 구현(Q1-B). 데이터량이 작아 성능 이점이 결정적이지 않고, 직접 구현은 음영·이중축·범례 비용↑. functional-spec 가정과의 정합과 유지보수성에서 Chart.js가 우위.
- **버전 고정**: 구체 메이저/마이너 버전은 code-generation 스캐폴딩에서 번들 크기·브라우저 호환을 확인해 고정한다.

## Sources

- Q1·Q2·Q3 (nfr-requirements-questions.md): 차트 라이브러리·성능 정책 확정.
- functional-spec.md §4·§7: 상세 그래프 이중축·음영 요구, 다크모드·반응형·접근성.
- requirements.md NFR1·NFR2·NFR5·NFR6·NFR7: 접근성·플랫폼·무료·보안·호스팅 제약.
- team.md Code Style(Prettier+ESLint, camelCase), Deployment(정적 호스팅), project.md Mandated(무료 범위).

## Assumptions & Open Questions

- Chart.js·annotation 플러그인의 구체 버전과 빌드/테스트 러너(예: Vite/Bun/Vitest 등)는 전체 번들과 함께 code-generation 스캐폴딩에서 확정. [assumption]
