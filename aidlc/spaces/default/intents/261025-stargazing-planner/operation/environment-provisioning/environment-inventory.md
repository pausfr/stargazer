# Environment Inventory — stargazing-planner

> 무료 정적 웹 앱(Vite 번들). 단일 정적 호스팅 환경 하나. AWS·VPC·서버·DB 없음.
> 근거: infrastructure-specification.md, cd-config.md, team.md Deployment, NFR7.

## 환경 목록

| 환경 | 종류 | 호스팅 | 상태 |
|------|------|--------|------|
| 운영(공개) | 정적 사이트(CDN 서빙) | 무료 정적 호스팅(GitHub Pages / Vercel / Netlify 중 택1) | 미연결(Deployment Execution에서 연결·게시) |

- 별도 dev/staging/prod 티어 없음 — 단일 환경(team.md). 로컬 미리보기는 `npx vite preview` / `npx vite`.

## 리소스 인벤토리

| 리소스 | 내용 |
|--------|------|
| 컴퓨트 | 없음(정적 파일만, 서버리스 함수도 없음) |
| 네트워크 | 제공자 CDN + HTTPS(사용자 구성 VPC/서브넷/SG/NACL 없음) |
| 스토리지 | 정적 자산(`dist-web/`)만. DB·오브젝트 스토리지 없음 |
| 시크릿 | 없음(키 없는 공개 API, NFR6.1). 배포 토큰이 필요하면 CI 시크릿에만 보관 |
| 외부 런타임 의존 | 브라우저 → 공개 날씨 API(U2) 1개(키 불필요, HTTPS/CORS) |

## 프로비저닝 작업(Deployment Execution에서 수행)

1. 호스팅 제공자 선택·계정 연결(무료 티어).
2. 리포지토리 연결 + 빌드 명령 `npx vite build`, 출력 디렉터리 `dist-web` 지정.
3. (GitHub Pages면) Pages 활성화 + 배포 워크플로 권한(pages: write, id-token: write).
4. 커스텀 도메인은 선택(미사용 시 제공자 기본 도메인).

## 환경 패리티

- 단일 환경이라 티어 간 패리티 이슈 없음. 로컬 `vite preview`와 운영 번들은 동일 빌드 산출.

## Sources

- infrastructure-specification.md(정적 호스팅), cd-config.md(배포 모델), team.md Deployment, NFR7, project.md(비밀값 금지).

## Assumptions & Open Questions

- 제공자 최종 선택은 Deployment Execution에서 사람과 확정(기본 제안: GitHub Pages — 리포가 GitHub일 때 추가 비용·계정 없이 가장 단순). [assumption]
