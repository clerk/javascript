import stylex from '@stylexjs/unplugin/vite';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const mosaicPath = resolve(import.meta.dirname, 'src');
const featureTests = 'src/**/*.feature.test.tsx';
const webkitTests = 'src/**/*.webkit.test.tsx';
const handoffTests = 'src/experimental/loom/__tests__/loom-handoff-react19.feature.test.tsx';
const requireNext = createRequire(new URL('../swingset/package.json', import.meta.url));
const requireLoom = createRequire(new URL('../loom/package.json', import.meta.url));
const requireShared = createRequire(new URL('../shared/package.json', import.meta.url));
const compiled = (entry: string) => requireNext.resolve(`next/dist/compiled/${entry}`);

const streamingReact = {
  alias: [
    { find: /^react$/, replacement: compiled('react') },
    { find: /^react\/(.*)$/, replacement: `${compiled('react').replace(/index\.js$/, '')}$1` },
    { find: /^react-dom$/, replacement: compiled('react-dom') },
    { find: /^react-dom\/test-utils$/, replacement: compiled('react') },
    { find: /^react-dom\/(.*)$/, replacement: `${compiled('react-dom').replace(/index\.js$/, '')}$1` },
    { find: /^@tanstack\/query-core$/, replacement: requireLoom.resolve('@tanstack/query-core') },
    { find: /^dequal$/, replacement: requireShared.resolve('dequal') },
  ],
  dedupe: ['react', 'react-dom'],
};

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
    // never picked up the requestAnimationFrame mock in the Mosaic setup (it changes floating-ui's
    // focus-on-open timing). Keeping them on their own project here, instead of folding them into
    // the jsdom project, preserves that behavior post-move.
    projects: [
      {
        extends: true,
        test: {
          name: 'primitives',
          environment: 'happy-dom',
          include: ['src/primitives/**/*.test.?(c|m)[jt]s?(x)', 'src/primitives/**/*.spec.?(c|m)[jt]s?(x)'],
          exclude: [webkitTests],
          setupFiles: ['./src/primitives/test-utils/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'mosaic',
          include: ['**/*.test.?(c|m)[jt]s?(x)', '**/*.spec.?(c|m)[jt]s?(x)'],
          exclude: ['src/primitives/**', featureTests, webkitTests, handoffTests],
          setupFiles: [resolve(import.meta.dirname, 'vitest.setup.mts')],
        },
      },
      {
        extends: true,
        publicDir: 'test/public',
        optimizeDeps: {
          include: [
            '@clerk/clerk-js',
            '@wallet-standard/core',
            '@testing-library/jest-dom/matchers',
            '@testing-library/react',
            '@testing-library/user-event',
            'msw',
            'msw/browser',
          ],
        },
        test: {
          name: 'feature',
          include: [featureTests],
          exclude: [handoffTests],
          setupFiles: [resolve(import.meta.dirname, 'vitest.setup.browser.mts')],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        resolve: streamingReact,
        publicDir: 'test/public',
        optimizeDeps: {
          include: [
            '@tanstack/query-core',
            '@clerk/clerk-js',
            '@wallet-standard/core',
            '@testing-library/jest-dom/matchers',
            '@testing-library/react',
            '@testing-library/user-event',
            'dequal',
            'msw',
            'msw/browser',
          ],
        },
        test: {
          name: 'handoff',
          include: [handoffTests],
          setupFiles: [resolve(import.meta.dirname, 'vitest.setup.browser.mts')],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'webkit',
          include: [webkitTests],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'webkit' }],
          },
        },
      },
    ],
  },
});
