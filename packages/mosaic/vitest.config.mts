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
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 5000,
    // Primitives ran as their own package on happy-dom with no setup beyond matchers, so they
    // never picked up clerk-js's shared jsdom mocks (including a requestAnimationFrame mock that
    // changes floating-ui's focus-on-open timing). Keeping them on their own project here, instead
    // of folding them into the root jsdom project, preserves that behavior post-move.
    projects: [
      {
        extends: true,
        test: {
          name: 'primitives',
          environment: 'happy-dom',
          include: ['src/primitives/**/*.test.?(c|m)[jt]s?(x)', 'src/primitives/**/*.spec.?(c|m)[jt]s?(x)'],
          setupFiles: ['./src/primitives/test-utils/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'mosaic',
          include: ['**/*.test.?(c|m)[jt]s?(x)', '**/*.spec.?(c|m)[jt]s?(x)'],
          exclude: ['src/primitives/**'],
          setupFiles: ['../clerk-js/vitest.setup.mts'],
        },
      },
    ],
  },
});
