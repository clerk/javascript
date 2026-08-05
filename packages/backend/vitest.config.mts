import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    typecheck: {
      enabled: true,
      include: ['**/*.test.ts', '**/*.test-d.ts'],
    },
    coverage: {
      provider: 'v8',
    },
    fakeTimers: {
      toFake: ['setTimeout', 'clearTimeout', 'Date'],
    },
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
