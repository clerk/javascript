import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
