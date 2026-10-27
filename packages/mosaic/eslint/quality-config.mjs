import tseslint from 'typescript-eslint';

import codeQuality from './code-quality.mjs';
import goodCss from './good-css.mjs';
const testFiles = ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/*.test-d.ts'];
export default [
  {
    ...tseslint.configs.disableTypeChecked,
    name: 'packages/mosaic - lint tooling',
    files: ['packages/mosaic/eslint/*.mjs'],
  },
  {
    name: 'packages/mosaic - code quality',
    files: ['packages/mosaic/src/**/*.{ts,tsx}'],
    ignores: testFiles,
    plugins: { 'code-quality': codeQuality },
    rules: {
      'code-quality/no-accumulator-copy': 'warn',
      'code-quality/no-chained-type-assertions': 'warn',
      'code-quality/no-widen-then-assert': 'warn',
    },
  },
  {
    name: 'packages/mosaic - internal conditions',
    files: ['packages/mosaic/src/{utils,machine}/**/*.{ts,tsx}'],
    ignores: testFiles,
    rules: { '@typescript-eslint/no-unnecessary-condition': 'warn' },
  },
  {
    name: 'packages/mosaic - css conventions',
    files: ['packages/mosaic/src/**/*.styles.ts'],
    ignores: testFiles,
    plugins: { 'good-css': goodCss },
    rules: {
      'good-css/explicit-transition-properties': 'error',
      'good-css/reduced-motion': 'error',
      'good-css/preserve-focus-outline': 'error',
    },
  },
];
