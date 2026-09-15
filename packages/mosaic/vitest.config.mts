import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const mosaicPath = resolve(import.meta.dirname, 'src');

export default defineConfig({
  plugins: [
    stylex({ dev: true, unstable_moduleResolution: { type: 'commonJS', rootDir: mosaicPath } }),
    react({ jsxRuntime: 'automatic' }),
  ],
  test: {
    watch: false,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    globals: false,
    include: ['**/*.test.?(c|m)[jt]s?(x)', '**/*.spec.?(c|m)[jt]s?(x)'],
    exclude: ['node_modules/**', 'dist/**'],
    setupFiles: '../clerk-js/vitest.setup.mts',
    testTimeout: 5000,
  },
});
