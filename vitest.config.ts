import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      // 커버리지 플로어는 핵심 계산 모듈에만 적용(team.md Q4).
      // 단위 실행 명령이 --coverage.include 로 경로를 한정한다.
      exclude: ['**/__tests__/**', '**/*.config.*', '**/types.ts', 'dist/**'],
    },
  },
});
