# CI/CD Pipeline — u4-web-ui (번들 진입점, 공유 파이프라인)

> 단위 U4 u4-web-ui (kind: ui, **번들 진입점**). 근거: nfr-design(security-design SD1~SD4·performance-design), infrastructure-specification(배포 모델), contract-summary(C4 외부 날씨 API), team.md(Deployment·Code Style·Testing Posture), project.md(무료 범위·비밀값 비하드코딩·커버리지 측정 학습), infrastructure-design-questions.md(Q2). u4가 번들 진입점이므로 이 문서가 u1~u3이 참조한 **공유 CI 파이프라인의 전체 정의**다.
> 단일 정적 번들: u1(astronomy)·u2(weather-data)·u3(domain-rules)·u4(web-ui)가 하나의 번들로 빌드·배포된다. 별도 운영 환경·수동 프로덕션 게이트 없음(team.md Deployment).

## 배포 모델

- **대상**: 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 무료 티어 중 1곳, code-generation/배포에서 확정). HTTPS·CDN 제공자 기본.
- **트리거**: `main` 머지 시 자동 배포(deploy-on-merge, team.md Deployment). 별도 수동 프로덕션 승인 게이트 없음(1인 개인 앱).
- **롤백**: 호스팅 제공자의 이전 배포로 되돌리거나 `main` 직전 커밋 재배포(team.md Deployment).
- **환경**: 로컬 개발 + 단일 프로덕션 정적 사이트. staging 상시 운영 없음.

## 파이프라인 — 공유 CI (GitHub Actions 무료 티어)

`main` PR/머지에서 번들 전체에 대해 순차 실행. 어느 단계든 실패하면 머지/배포를 막는다(team.md Code Style: 린트 실패는 PR 차단).

```
1. 설치:        npm ci
2. 린트:        npx eslint src            # 번들 전체(u1~u4), Prettier+ESLint(team.md)
3. 타입체크:    npx tsc --noEmit          # 저장소 전체 strict
4. 단위 테스트: 핵심 계산 모듈 경로 한정 커버리지(각 단위):
                npx vitest run src/astronomy    --coverage --coverage.include='src/astronomy/**'
                npx vitest run src/weather-data --coverage --coverage.include='src/weather-data/**'
                npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'
                # 핵심 계산/판정 모듈 라인 커버리지 ≥ 80% 플로어(team.md Q4·project.md 학습)
                # u4(UI)·외부 어댑터는 느슨(수동 스모크 보완, team.md)
5. 빌드:        번들러 빌드(Vite 등) → 정적 출력 디렉터리 생성
6. 시크릿 스캔: 하드코딩 시크릿 0건(번들 전체 1회; NFR6.1·project.md Forbidden)
7. 배포:        main 머지 시 정적 호스팅 자동 배포(5의 출력 디렉터리)
```

### 스테이지 → 게이트 매핑

| Stage | Gate(통과 조건) | 실패 시 |
|-------|-----------------|---------|
| 린트 | eslint 위반 0 | 머지 차단 |
| 타입체크 | tsc --noEmit 에러 0 | 머지 차단 |
| 단위 테스트 | 핵심 모듈 경로 한정 커버리지 ≥ 80%, 전 테스트 green | 머지 차단 |
| 빌드 | 번들 빌드 성공 | 머지 차단 |
| 시크릿 스캔 | 하드코딩 시크릿 0건 | 머지 차단 |
| 배포 | (머지 시) 제공자 배포 성공 | 롤백 가능, 배포 알림 |

- 커버리지 ≥ 80% 플로어의 CI 강제 방식(vitest `coverage.thresholds` 주입 vs 측정 후 리뷰 기반 수동 확인)은 code-generation에서 확정한다. 현재 `vitest.config.ts`에는 thresholds가 없어 경로 한정 측정은 되지만 자동 차단은 code-generation에서 결정한다(u1~u3 문서와 동일 표현).
- 커버리지 측정은 `src/<unit>`로 경로를 한정한다(project.md 학습: 루트 v8 전체 집계가 `.kiro` 툴링까지 포함해 플로어를 희석하는 문제 회피).

## 외부 호출·테스트 격리

- 런타임 유일한 외부 경계는 브라우저 → 무료 날씨 API(C4). CI의 단위 테스트는 외부 네트워크를 호출하지 않는다 — U2 어댑터 테스트는 응답을 목(mock)으로 주고 C2 3-상태(known/outOfHorizon/unknown) 정규화를 검증한다(네트워크 비의존·결정성).
- u4(UI)·외부 API 연동은 수동 스모크로 보완한다(team.md Testing Posture). 자동 E2E·성능 테스트는 이 MVP 범위에 두지 않는다.

## 비밀값·구성 (CI/CD)

- 비밀값 없음(NFR6.1·SD1). 키 불필요 공개 날씨 API 전제이므로 CI/배포에 시크릿·환경 변수 주입이 불필요하다.
- 키가 필요한 API로 바뀌면 프록시 여부와 시크릿 매니저(제공자 환경 변수/시크릿) 도입은 그때 별도 설계한다(현재 범위 밖).
- 정적 호스팅 제공자 토큰 등 배포 자격은 GitHub/제공자의 기본 시크릿 저장소에 두고 번들·코드에 넣지 않는다.

## Sources

- security-design.md(SD1~SD4), performance-design.md, infrastructure-specification.md, contract-summary.md(C4), team.md(Deployment·Code Style·Testing Posture), project.md(무료 범위·비밀값·커버리지 측정 학습), infrastructure-design-questions.md(Q2).

## Assumptions & Open Questions

- 공유 CI의 구체 플랫폼(GitHub Actions)·번들러(Vite 등)·커버리지 자동 차단 방식과 호스팅 제공자 1곳은 code-generation/배포 단계에서 최종 확정한다. [assumption]
