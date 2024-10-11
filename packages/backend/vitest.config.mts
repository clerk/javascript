import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    setupFiles: './vitest.setup.mts',
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
  },
});
