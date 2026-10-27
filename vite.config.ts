import { defineConfig } from 'vite';

/**
 * Vite 번들 설정 (u4-web-ui, NFR7).
 *
 * 정적 단일 번들을 산출하는 프레임워크 없는 Vanilla TypeScript 앱이다.
 * 진입점은 루트 `index.html`이며, 비밀값·API 키는 번들에 포함하지 않는다
 * (NFR6.1; U2가 키 불필요 공개 API를 쓴다). 개발 서버는 `npm run dev`,
 * 정적 번들 빌드는 `npm run build:web`(= `vite build`)이다.
 */
export default defineConfig({
  // 상대 경로 자산 참조로 정적 호스팅(하위 경로 포함)에서 안전하게 열리게 한다.
  base: './',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
    target: 'es2020',
  },
});
