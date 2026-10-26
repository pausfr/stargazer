# Tech Stack Decisions — u1-astronomy

> 단위 U1 u1-astronomy (kind: library). 근거: nfr-requirements-questions.md(Q1·Q2·Q4), contract-summary.md(C5), team-practices(Code Style). 구체 패키지 확정은 code-generation.

## 기술 선택

| 영역 | 선택 | 근거 |
|------|------|------|
| 언어 | TypeScript | 팀 코드 스타일(Prettier+ESLint, camelCase), 브라우저 런타임, 타입 계약(C1)과 정합 |
| 런타임 대상 | 브라우저(정적 번들의 일부, embedded) | ADR-001 백엔드 없는 정적 클라이언트 앱 |
| 모듈 형태 | 순수 함수 라이브러리(부작용·네트워크 없음) | 결정론적 계산, 테스트 용이, 핵심 계산 모듈 커버리지 집중 |
| 천문 계산 | 무료·오픈소스 천문 계산 라이브러리(키 불필요, 브라우저 동작) | C5 소비 경계, NFR5 무료, 직접 공식 구현 대비 정확도·유지보수 우위 |
| 빌드·테스트 러너 | 프로젝트 공통 선택(code-generation 스캐폴딩에서 확정) | 전체 번들과 통일; u1 단독으로 결정하지 않음 |

## 천문 라이브러리 후보 (code-generation에서 확정)

1순위와 대안을 기록한다. 최종 선택은 code-generation 스캐폴딩에서 라이선스·번들 크기·정확도·API 적합성을 확인해 확정(A3).

- **1순위**: `astronomy-engine` 류 — 순수 JS/TS, 의존성 없음, 브라우저 동작, 달 위상·조도·박명·월출몰 지원, MIT류 무료 라이선스. u1이 필요한 계산(조도 0~100%, 시민/항해/천문 박명, 월출/월몰)을 모두 커버하는지 code-generation에서 검증.
- **대안 A**: 다른 무료 천문 계산 라이브러리(동등 기능·무료 라이선스).
- **대안 B**: 핵심 공식 직접 구현(라이브러리가 요구 기능을 못 채우거나 라이선스 문제 시). 비용↑·정확도 책임↑이라 최후 수단.

선정 기준: (1) 무료·오픈소스 라이선스(NFR5), (2) 키 불필요·네트워크 불필요(NFR6), (3) 브라우저 번들에서 동작, (4) 조도·박명 3종·월출/월몰을 KST 변환 가능한 형태로 제공.

## Sources

- Q1·Q2·Q4 (nfr-requirements-questions.md).
- C5 (contract-summary.md): 천문 라이브러리 소비 경계.
- team.md Code Style, Deployment(정적 호스팅), project.md Mandated(무료 범위).

## Assumptions & Open Questions

- 구체 천문 라이브러리 패키지와 전국 대표 좌표의 좌표값은 code-generation에서 확정(A3). [assumption]
- 빌드/테스트 러너(예: Vite/Bun/Vitest 등)는 전체 번들과 함께 code-generation 스캐폴딩에서 확정. [assumption]
