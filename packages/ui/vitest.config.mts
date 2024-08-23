import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    alias: {
      '~/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
