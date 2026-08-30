import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.type.{test,spec}.{ts,tsx}'],
    },
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
