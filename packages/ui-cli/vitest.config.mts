import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.spec.{js,ts}'],
    setupFiles: './vitest.setup.mts',
  },
});
