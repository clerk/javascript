import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const { name, version } = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      'vitest-chrome': 'vitest-chrome/lib/index.esm.js',
    },
  },
  define: {
    PACKAGE_NAME: JSON.stringify(name),
    PACKAGE_VERSION: JSON.stringify(version),
  },
  test: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.test.{ts,tsx}'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
    },
    environment: 'jsdom',
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
