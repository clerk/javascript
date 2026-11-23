import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '#components': fileURLToPath(new URL('./src/components.client.ts', import.meta.url)),
    },
  },
  test: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.{test.ts,test.tsx}'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
    },
    environment: 'jsdom',
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
