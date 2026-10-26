# CI/CD Pipeline — u3-domain-rules

> 단위 U3 u3-domain-rules (kind: library, embedded). 근거: nfr-design(security-design·logical-components), contract-summary(C3), team.md Deployment, units-generation(배포 모델: 단일 정적 번들). U3는 외부 I/O·비밀값·별도 인프라가 없어, CI는 번들 공유 파이프라인의 U3 몫(품질 게이트)에 한정된다.

## 배포 모델
- U3는 단일 정적 번들에 임베드되는 라이브러리다(standalone 인프라 없음). U4가 번들 진입점이며, U1~U3는 그 안에 빌드된다.
- 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 무료 티어)에 `main` 머지 시 자동 배포(team.md Deployment). 별도 운영 환경·수동 프로덕션 게이트 없음.

## CI 파이프라인 — U3 몫 (공유 CI의 품질 게이트)

main 머지 전/머지 시 공유 CI에서 U3에 대해 실행:

```
1. 설치:        npm ci
2. 린트:        npx eslint src/domain-rules
3. 타입체크:    npx tsc --noEmit            # 저장소 전체 strict, U3 포함
4. 단위 테스트: npx vitest run src/domain-rules --coverage --coverage.include='src/domain-rules/**'
                # 핵심 계산/판정 모듈 라인 커버리지 ≥ 80% 플로어(team.md Q4)
```

- 공유 CI의 secret scan(하드코딩 시크릿 0건)은 번들 전체에 1회 적용되며, U3는 비밀값이 없어 자명 통과한다(u1·u2 문서와 게이트 표현 정합).
- 커버리지 ≥ 80% 플로어의 CI 강제 방식(vitest `coverage.thresholds` 주입 vs 측정 후 리뷰 기반 수동 확인)은 code-generation에서 확정한다. 현재 `vitest.config.ts`에는 thresholds가 없어 경로 한정 측정은 되지만 자동 차단은 code-generation에서 결정한다(u1·u2와 동일 표현).
- 외부 네트워크 호출 없음: U3는 순수 규칙 라이브러리라 CI에서 외부 API·비밀값이 필요 없다(u2와 달리 어댑터도 없음).
- 커버리지 플로어는 측정을 `src/domain-rules`로 한정한다(project.md 학습: 루트 v8 전체 집계가 플로어를 희석하는 문제 회피).
- 어느 단계든 실패하면 머지/배포를 막는다(team.md Code Style: 린트 실패는 PR 차단).

## 비밀값·구성
- 비밀값 없음(NFR6.1). 환경 변수·시크릿 매니저 불필요.
- 공휴일 테이블은 코드 내장 상수(외부 소스 없음). 커버 연도 범위 갱신은 수동 연 1회 유지보수(NFR-U3-MAINT.1).

## 롤백
- 정적 호스팅 제공자의 이전 배포로 되돌리거나 `main` 직전 커밋으로 재배포(team.md Deployment).

## Sources
- security-design.md·logical-components.md(U3), contract-summary.md(C3), team.md(Deployment·Code Style·Testing Posture), project.md(커버리지 측정 학습), units-generation/unit-of-work.md(배포 모델).

## Assumptions & Open Questions
- 공유 CI의 구체 플랫폼(GitHub Actions 등)과 번들러(Vite 등)는 U4(번들 진입점) 설계·code-generation에서 확정한다. U3는 그 CI에 위 품질 게이트를 기여한다. [assumption]
