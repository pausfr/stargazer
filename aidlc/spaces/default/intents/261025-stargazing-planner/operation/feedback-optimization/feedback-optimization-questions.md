# Feedback & Optimization — 질문

> 운영 피드백을 모아 다음 반복으로 돌려보내는 마지막 단계. 아직 게시 전이라 실제 운영
> 지표는 없고, 이번 사이클에서 쌓인 결정·이월 항목·개선 여지를 정리한다. 무료 정적 앱이라
> 비용·드리프트는 사실상 N/A. 근거: slo-config.md, performance-validation/test-results.md,
> project.md(이월 학습), team.md.

## Q1. 어떤 운영 신호를 모아 다음 반복에 반영할까?

A. **이번 사이클 결정·이월 항목 중심** — 실제 운영 지표는 게시 후에 쌓이므로, 지금은
   (1) 재작업에서 얻은 교훈(테스트 정합·추적 스키마 등, project.md에 기록됨),
   (2) 이월된 다음 버전 후보(지역 구획 선택/비교, 상세 이전/다음 연휴 네비, 천문 이벤트
   비교, 배경 이미지 최적화)를 피드백 루프 문서로 모은다. 게시 후엔 제공자 Analytics·
   사용자(지인) 피드백을 추가로 수집. (권장)
X. Other (please specify)

[Answer]: A

## Q2. 비용 분석

A. **비용 $0(무료 티어)** — 무료 정적 호스팅 + 키 없는 공개 날씨 API + 오픈소스 천문 계산.
   런타임 유료 자원 없음(project.md: 모든 데이터 소스는 무료 티어 범위). 비용 최적화 대상 없음. (권장)
X. Other (please specify)

[Answer]: A

## Q3. 드리프트(인프라 실제 상태 ↔ 정의) 점검

A. **해당 없음(N/A)** — IaC로 관리하는 서버·클라우드 리소스가 없다(정적 호스팅은 제공자
   관리). 드리프트 탐지 대상 없음. 배포 산출물은 `main`+`dist-web/`이 단일 소스. (권장)
X. Other (please specify)

[Answer]: A

## Q4. 다음 반복으로 올릴 피드백·개선 제안

A. **다음 버전 백로그로 정리** — 이월 항목을 우선순위와 함께 feedback-loop.md에 기록:
   (1) 한국 ~5개 지역 구획 선택/비교(현재 전국 대표 좌표 하나), (2) 배경 이미지 최적화
   (3.6MB), (3) 상세 화면 이전/다음 연휴 네비게이션, (4) 천문 이벤트(은하수·행성·유성우·
   별자리) 비교(열린 항목), (5) 게시 후 성능 수동 스모크 결과 반영. (권장)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
