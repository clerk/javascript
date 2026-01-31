import * as path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    watch: false,
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.type.{test,spec}.{ts,tsx}'],
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
