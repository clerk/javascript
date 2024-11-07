import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    coverage: {
      provider: 'v8',
    },
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
