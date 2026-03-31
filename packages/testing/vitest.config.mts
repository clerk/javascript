import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    typecheck: {
      enabled: true,
      include: ['**/*.test.ts'],
    },
    coverage: {
      provider: 'v8',
    },
    fakeTimers: {
      toFake: ['setTimeout', 'clearTimeout'],
    },
  },
});
