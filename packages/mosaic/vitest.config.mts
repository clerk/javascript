import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const mosaicPath = resolve(import.meta.dirname, 'src');

const primitiveTests = [
  'src/primitives/**/*.test.?(c|m)[jt]s?(x)',
  'src/__tests__/floating-tree.test.tsx',
  'src/hooks/use-*.test.?(c|m)[jt]s?(x)',
  'src/utils/{css-vars,freeze,interaction-modality,interaction-origin,side-offset,use-render}.test.?(c|m)[jt]s?(x)',
];

export default defineConfig({
  plugins: [
    stylex({ dev: true, unstable_moduleResolution: { type: 'commonJS', rootDir: mosaicPath } }),
    react({ jsxRuntime: 'automatic' }),
  ],
  test: {
    watch: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'mosaic',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              resources: 'usable',
            },
          },
          globals: false,
          include: ['**/*.test.?(c|m)[jt]s?(x)', '**/*.spec.?(c|m)[jt]s?(x)'],
          exclude: ['node_modules/**', 'dist/**', ...primitiveTests],
          setupFiles: ['../clerk-js/vitest.setup.mts'],
          testTimeout: 5000,
        },
      },
      {
        test: {
          name: 'primitives',
          environment: 'happy-dom',
          include: primitiveTests,
          setupFiles: ['./vitest.primitives.setup.mts'],
        },
      },
    ],
  },
});
