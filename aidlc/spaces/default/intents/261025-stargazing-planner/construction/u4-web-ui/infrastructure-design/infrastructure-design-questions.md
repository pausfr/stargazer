# Infrastructure Design Questions — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui). u4는 **번들 진입점**이라 전체 단일 정적 번들의 배포·공유 CI·모니터링이 여기서 확정된다(u1~u3는 그 안에 빌드). 근거: nfr-design(performance/security/logical-components), components.md, functional-spec, contract-summary(C4 외부 날씨 API만 네트워크 경계), team.md(Deployment·Code Style), project.md(무료 범위·비밀값 비하드코딩).
> 백엔드·서버·클라우드 리소스가 없다(정적 번들). 그래서 "인프라"는 (1) 무료 정적 호스팅 배포, (2) 공유 CI 파이프라인, (3) 정적 호스팅 수준 모니터링으로 한정된다. 아래는 그 구체 선택 공백만 묻는다.

## Q1. [AWS/플랫폼] 정적 호스팅·배포

번들의 배포 대상과 방식을 확정할까요? (team.md Deployment와 정합)

A. 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 무료 티어 중 하나)에 `main` 머지 시 자동 배포. 별도 운영 환경·수동 프로덕션 게이트 없음. 롤백은 호스팅 제공자의 이전 배포 또는 `main` 직전 커밋 재배포. 구체 제공자는 code-generation/배포 단계에서 1곳으로 확정하되 설계는 "제공자 무관 정적 번들 + 머지 시 자동 배포"로 둠 (권장)
B. 특정 제공자로 지금 못박거나 다른 배포 방식
X. Other (please specify)

[Answer]:A

## Q2. [AWS/플랫폼] 공유 CI 파이프라인

번들 전체 CI를 어떻게 구성할까요? (u1~u3 문서가 참조하는 "공유 CI"의 실체)

A. GitHub Actions(무료 티어)로 `main` PR/머지에서: `npm ci` → 린트(`eslint`) → 타입체크(`tsc --noEmit`) → 단위 테스트(`vitest run`, 핵심 계산 모듈 `src/<unit>` 경로 한정 커버리지 ≥ 80%) → 빌드(번들러) → 시크릿 스캔(하드코딩 0건) → 머지 시 정적 호스팅 자동 배포. 어느 단계 실패든 머지/배포 차단. 구체 플랫폼·번들러(Vite 등)는 code-generation에서 최종 고정하되 설계는 이 단계 구성으로 확정 (권장)
B. 다른 CI 구성/플랫폼
X. Other (please specify)

[Answer]:A

## Q3. [AWS/플랫폼] 모니터링 범위

정적 개인 앱의 모니터링을 어디까지 둘까요? (NFR3 정량 목표 없음·무료 범위)

A. 가벼운 수준으로 한정 — (1) 호스팅 제공자 기본 배포 상태/빌드 성공·실패(무료 제공), (2) 선택적 무료 브라우저 에러 가시성(예: 콘솔 에러 수동 확인; 외부 유료 APM 미도입), (3) 핵심 "사용자 영향" 신호는 외부 날씨 API(C4) 호출 실패율을 UI partial 상태 빈도로 간접 관찰(코드 레벨 로깅은 로그 전용 reason, UI 비노출 SD3와 정합). 별도 서버·대시보드·알림 인프라 없음(무료·서버리스리스 전제) (권장)
B. 더 갖춘 모니터링(외부 APM·대시보드·알림)이 필요하다
X. Other (please specify)

[Answer]:A

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
