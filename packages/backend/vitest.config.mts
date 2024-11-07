import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
