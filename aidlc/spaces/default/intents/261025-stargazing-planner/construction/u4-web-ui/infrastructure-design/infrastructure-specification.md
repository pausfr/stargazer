# Infrastructure Specification — u4-web-ui

> 단위 U4 u4-web-ui (kind: ui, **번들 진입점**). 근거: nfr-design(performance-design PD1~PD4·security-design SD1~SD4·logical-components), components.md, functional-spec(§1~§6), contract-summary(C4 외부 날씨 API만 네트워크 경계), team.md(Deployment), project.md(무료 범위·비밀값 비하드코딩), infrastructure-design-questions.md(Q1~Q3). 설계 수준(무엇이 왜 필요한가)만; 구체 IaC·설정 파일은 code-generation.
> 이 앱은 백엔드·서버·클라우드 리소스가 없는 단일 정적 번들이다. u4가 번들 진입점이며 u1~u3는 그 안에 빌드된다. 따라서 "인프라"는 무료 정적 호스팅 배포와 공유 CI로 한정된다.

## Deployment

| Facet | Choice | Rationale |
|-------|--------|-----------|
| 컴퓨트 모델 | 없음(서버리스리스) — 100% 클라이언트 정적 번들(HTML/CSS/JS) | 백엔드 없음(ADR-001). 천문 계산 U1·규칙 U3는 브라우저 내 실행, 외부 호출은 U2가 브라우저에서 직접 공개 날씨 API 호출(C4) |
| 네트워킹 토폴로지 | 정적 자산은 호스팅 제공자 CDN에서 서빙. 런타임 외부 경계는 브라우저 → 무료 공개 날씨 API(C4) 단방향 fetch뿐 | 서버·VPC·인그레스 없음. 네트워크 경계 최소(NFR6·NFR7) |
| 스토리지 전략 | 영속 서버 저장 없음. 런타임 상태는 브라우저 메모리(공유 DataCache, 세션 수명, PD3). 빌드 산출물(정적 파일)만 호스팅에 업로드 | 개인용·읽기 전용 표시 앱, PII 미수집(SD4). 민감정보 저장 없음 |
| 환경 | 단일 프로덕션(정적 사이트) + 로컬 개발. 별도 staging 운영 안 함 | 1인 개인 앱, 운영 환경 분리 불필요(team.md Deployment) |
| IaC 접근 | 인프라 IaC 없음(프로비저닝할 클라우드 리소스 없음). 배포는 호스팅 제공자 설정(빌드 명령·출력 디렉터리)으로 선언 | 정적 번들이라 CDK/Terraform 대상 리소스가 없음. AWS Well-Architected의 "IaC" 원칙은 "콘솔 수동 변경 금지 → 제공자 설정을 리포지토리에 선언"으로 치환 적용 |
| 리소스 사이징 | 해당 없음(서버·DB·인스턴스 없음). 번들 크기만 관리 대상 | 무료 티어 범위(NFR5), Chart.js 등 의존 번들 크기는 code-generation에서 관찰 |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---------|------|---------------|-------|
| 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 중 1곳) | static-hosting / cdn | 빌드 출력 디렉터리 서빙, HTTPS 기본, 글로벌 CDN(제공자 기본) | 무료 티어(NFR5·NFR7). 구체 제공자는 code-generation/배포에서 1곳 확정, 설계는 제공자 무관 |
| 외부 무료 날씨 API(C4, 예: Open-Meteo류) | external data source | 키 불필요 공개 API 우선, 브라우저에서 직접 fetch, 짧은 캐시(U2 DataCache) | u2-weather-data 소유 경계. u4는 공유 캐시 수명만 관리(PD3). 키 필요해지면 프록시 여부는 별도 결정(NFR6) |
| 데이터베이스 / 큐 / 검색 / 로드밸런서 | 해당 없음 | — | 백엔드 없는 정적 앱이라 미사용 |

## Shared Infrastructure

여러 단위가 공유하는 런타임 인프라 리소스는 없다(각 단위는 번들 내 모듈이며 네트워크 리소스를 공유하지 않는다). 공유되는 것은 **배포 파이프라인과 번들 자체**이며, 그 소유·구성은 cicd-pipeline.md가 규정한다. 런타임에서 u4가 보유해 하위 단위 호출에 주입하는 공유 객체(DataCache·nowMs)는 코드 레벨 공유(logical-components AppRoot)로, 인프라 리소스가 아니다.

## Well-Architected 치환 적용 (정적·무료 맥락)

- **운영 우수성**: 제공자 설정·CI를 리포지토리에 선언(콘솔 수동 변경 금지의 정적판), 머지 시 자동 배포.
- **보안**: 비밀값 비포함(SD1), HTTPS 기본, 공개 API만(키 없음). 공격 표면은 클라이언트 정적 자산으로 최소.
- **신뢰성**: 제공자 CDN의 가용성에 위임(1인 앱 SLA 불요). 외부 날씨 실패는 UI partial로 격리(PD1).
- **성능**: CDN 정적 서빙 + 점진 렌더(PD1)·공유 캐시(PD3).
- **비용**: 전 구성 무료 티어 범위(NFR5). 서버·DB 상시 비용 0.
- **지속가능성**: 서버리스리스 정적 번들로 상시 컴퓨트 0.

## Sources

- nfr-design(performance-design·security-design·logical-components), components.md, functional-spec.md(§1~§6), contract-summary.md(C4), team.md(Deployment), project.md(무료 범위·비밀값), infrastructure-design-questions.md(Q1~Q3).

## Assumptions & Open Questions

- 구체 호스팅 제공자(GitHub Pages/Vercel/Netlify 중 1곳)와 번들러·번들 크기 예산은 code-generation/배포 단계에서 확정한다. [assumption]
