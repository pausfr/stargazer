# Build Instructions — stargazing-planner

> 전체 번들(4개 단위: u1-astronomy, u2-weather-data, u3-domain-rules, u4-web-ui)의
> 빌드·검증 절차. 무료 정적 웹 앱(Vite 번들, 백엔드 없음)이다.

## 사전 요구 사항

- Node.js (프로젝트 로컬 `node_modules` 사용) + `npx`.
- 의존성은 고정 버전으로 핀됨: vitest 2.1.9, @vitest/coverage-v8 2.1.9,
  vite 5.4.11, chart.js 4.4.7, chartjs-plugin-annotation 3.1.0,
  chartjs-plugin-zoom, happy-dom 15.11.7, eslint 9.17.0, astronomy-engine.
  **새 의존성을 추가할 때 기존 핀을 범위로 풀거나 메이저를 올리지 말 것**
  (project.md 학습: 과거 vitest 2→4 승격이 커버리지 수집을 깨뜨림).

## 의존성 설치

```bash
npm install
```

> 주의: `npm install`이 핀된 버전을 캐럿 범위로 풀지 않도록 `package.json`·
> `package-lock.json`을 확인한다. 버전 불일치는 커버리지 수집 실패
> (`coverageFilesDirectory is required`)의 원인이 된다.

## 환경 설정

- 비밀값·API 키 없음(NFR6.1). 날씨 데이터는 키가 필요 없는 공개 API(Open-Meteo류)를
  U2가 소유. 환경변수·`.env` 불필요.
- 기본 테마 다크모드, 모바일 세로 뷰포트는 `index.html`에 포함.

## 빌드 명령

```bash
# 타입 검사(산출물 없음, 전 단위 타입 정합 확인)
npx tsc --noEmit

# 정적 웹 번들 산출(dist-web/)
npx vite build
```

- `tsc --noEmit`(package.json `build` 스크립트와 동일)로 전 단위 타입을 검사한다.
- `vite build`(`build:web` 스크립트)가 `dist-web/`에 정적 번들(index.html + assets)을 낸다.

## 빌드 검증

- `npx tsc --noEmit` exit 0(타입 오류 없음).
- `npx vite build`가 `dist-web/index.html`·`dist-web/assets/*`(JS/CSS/이미지)를 산출하고 exit 0.
- 검증 통과 기준(이 인텐트의 사람이 승인한 Construction 검증 명령):
  `npx tsc --noEmit && npx vitest run --coverage`.

## 흔한 빌드 문제

- **커버리지 수집 실패(`coverageFilesDirectory is required`)**: vitest/@vitest/coverage-v8
  메이저가 어긋난 경우. package.json 핀(둘 다 2.1.9)으로 되돌리고 재설치.
- **node 환경 테스트에서 `window is not defined`**: Chart.js/zoom 플러그인(hammerjs)이
  import 시점에 `window`를 요구. 해당 테스트 파일 상단에 `// @vitest-environment happy-dom`를 둔다.
- **한글 글리프 깨짐(차트 canvas)**: Chart.js canvas는 DOM CSS font-family를 따르지 않으므로
  `Chart.defaults.font.family`에 한글 지원 폰트 스택을 지정(chart.ts에 반영됨).
