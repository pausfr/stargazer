# Tech Stack Decisions — u2-weather-data

> 단위 U2 u2-weather-data (kind: library). 근거: nfr-requirements-questions.md(Q1·Q2), contract-summary.md(C4), team.md(Code Style). 구체 API 확정은 code-generation(A2).

## 기술 선택

| 영역 | 선택 | 근거 |
|------|------|------|
| 언어 | TypeScript | 전체 번들과 통일(u1과 동일), C2 타입 계약과 정합, Prettier+ESLint·camelCase |
| 런타임 대상 | 브라우저(정적 번들의 일부, embedded) | ADR-001 백엔드 없는 정적 클라이언트 앱 |
| HTTP 클라이언트 | 브라우저 내장 `fetch` + 타임아웃(AbortController) | 추가 의존 없음, 무료·경량. 외부 라이브러리 불필요 |
| 날씨 API | 무료·키 불필요 공개 API(Open-Meteo 1순위) | NFR5 무료, NFR6 키 불필요. C4 소비 경계 |
| 캐시 | 세션 범위 메모리 캐시(TTL) | FR5.3 무료 한도 보호, 오프라인 전용 영속 저장 불필요(NFR4). 외부 의존 없음 |
| 빌드·테스트 러너 | 프로젝트 공통(Vitest, u1에서 부트스트랩됨) | 전체 번들과 통일 |

## 날씨 API 후보 (code-generation에서 확정)

- **1순위**: **Open-Meteo** — 키 불필요, 무료, 상업적 이용 가능(비영리/개인 무료), 시간별 `cloudcover`(%) 제공, 좌표 기반 조회. 예보 범위가 보통 ~14일 이상이라 BR1.3 불변식(FORECAST_HORIZON_DAYS ≤ 실제 범위)을 14일로 두기에 적합.
- **대안 A**: 다른 무료·키 불필요 기상 API(구름량 제공, CORS 허용).
- **대안 B**: 키가 필요한 API — 정적 앱에서 키를 숨길 수 없으므로 피한다. 불가피하면 프록시 필요성을 사람에게 제기(Q1).

선정 기준: (1) 키 불필요(NFR6), (2) 무료 라이선스·무료 티어 한도(NFR5), (3) 브라우저 CORS 허용, (4) 시간별 구름량 제공, (5) 예보 범위가 FORECAST_HORIZON_DAYS(14일) 이상(BR1.3).

## Sources

- Q1·Q2 (nfr-requirements-questions.md), C4(contract-summary.md), team.md(Code Style, Deployment), project.md(Mandated 무료 범위, Forbidden 비밀값).

## Assumptions & Open Questions

- Open-Meteo의 실제 cloudcover 예보 범위·무료 한도·CORS 허용을 code-generation에서 확인하고, 범위가 14일과 다르면 FORECAST_HORIZON_DAYS를 그에 맞춘다(BR1.3). [assumption]
