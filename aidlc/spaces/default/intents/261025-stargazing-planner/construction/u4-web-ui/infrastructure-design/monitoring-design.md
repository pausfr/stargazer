# Monitoring Design — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui, 번들 진입점). 근거: nfr-design(observability는 service 전용이라 u4에 설계 없음 — 여기서 정적·무료 맥락의 플랫폼 모니터링만 정의), performance-design(PD1 partial 상태·PD3 캐시), security-design(SD3 내부 사유 비노출), functional-spec(§5 상태머신), contract-summary(C2 reason 로그 전용·C4 날씨 API), team.md(Deployment), infrastructure-design-questions.md(Q3).
> 백엔드·서버가 없고 무료·개인용 앱이라 모니터링은 가볍게 둔다. 외부 유료 APM·상시 대시보드·알림 인프라는 두지 않는다(Q3-A). "사용자 영향" 신호는 UI 상태 머신에서 자연히 드러나는 지표로 간접 관찰한다.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|--------|--------|-----------|----------------|
| 배포/빌드 성공·실패 | 호스팅 제공자 + GitHub Actions 기본 | 실패 0 유지 | 배포 파이프라인 건강(머지 시 자동 배포가 깨지면 즉시 가시) |
| CI 품질 게이트 통과 | GitHub Actions(lint/tsc/vitest/secret scan) | 전부 통과(실패 시 머지 차단) | 코드 품질·핵심 모듈 커버리지(≥80%)·시크릿 0건 보장 |
| 날씨 API 실패 → UI partial 빈도 | UI 상태 머신(§5): `state=partial`(날씨 unknown) 발생 | 상시 높음(지속 다수)이면 C4 API 건강·무료 한도 점검 신호 | 외부 날씨 API(C4) 가용성·무료 한도 소진을 사용자 영향(구름 표시 누락)으로 간접 관찰(PD1 격리와 정합) |
| 천문 계산 실패 → UI error 빈도 | UI 상태 머신(§5): `state=error`(astro throw) 발생 | 드묾 기대. 반복되면 U1 계산 경계 점검 | 핵심(천문) 실패는 error 상태로 드러남(FR6.2) |
| 번들 크기 | 빌드 산출물 | 과도 증가 시 점검(정량 상한은 code-generation) | 모바일 체감 로딩(NFR3)·무료 CDN 전송 |

## Alerts

| Alert | Condition | Severity | Routes to |
|-------|-----------|----------|-----------|
| 배포 실패 | 호스팅 제공자/Actions 배포 잡 실패 | P2 | 제공자·GitHub 기본 이메일 알림(개발자 본인) |
| CI 게이트 실패 | PR/머지 CI 잡 실패 | P2 | GitHub PR 상태 체크(머지 차단) |
| (외부 APM·실시간 사용자 알림) | 해당 없음 | — | 미도입(무료·개인 앱, Q3-A) |

별도 알림 인프라(PagerDuty·온콜)는 두지 않는다. 1인 앱이라 GitHub/제공자 기본 이메일 통지로 충분하다.

## SLIs / SLOs

| SLI | SLO target | Measurement window |
|-----|-----------|--------------------|
| 메인 목록 표시 체감 | 흔한 모바일 네트워크에서 "수 초 내 표시"(정성) | 수동 스모크(릴리스 시) |
| 배포 성공률 | 머지 시 자동 배포가 성공 | 릴리스 단위 |

> NFR3가 엄격한 정량 목표를 두지 않으므로(performance-design 정책) SLO도 정성·수동 스모크 수준으로 둔다. 정량 SLO·에러버짓은 이 앱 규모에 과하다.

## Logs & Tracing

- **로깅**: 서버 로그 없음(백엔드 없음). 브라우저 콘솔 에러를 개발 중 수동 확인한다. C2 `reason`·`AstronomyComputationError.code` 등 내부 진단은 콘솔/로그 전용이며 화면에 노출하지 않는다(SD3 정합).
- **트레이싱**: 분산 트레이싱 해당 없음(단일 클라이언트, 서비스 간 호출 없음). 유일한 외부 호출은 브라우저→날씨 API(C4) 단건.
- **대시보드**: 상시 대시보드 없음. 호스팅 제공자·GitHub Actions의 기본 빌드/배포 뷰로 대체.

## Sources

- performance-design.md(PD1·PD3), security-design.md(SD3), functional-spec.md(§5 상태머신), contract-summary.md(C2 reason 로그 전용·C4), team.md(Deployment), infrastructure-design-questions.md(Q3).

## Assumptions & Open Questions

- 선택적 무료 브라우저 에러 가시성 도구(예: 무료 티어 Sentry 등)의 도입 여부는 선택 사항으로, 필요 시 후속 버전에서 검토한다(현재 MVP는 수동 콘솔 확인). [assumption]
