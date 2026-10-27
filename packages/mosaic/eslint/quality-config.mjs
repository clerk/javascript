import tseslint from 'typescript-eslint';

import codeQuality from './code-quality.mjs';

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
    rules: { 'code-quality/no-accumulator-copy': 'warn', 'code-quality/no-chained-type-assertions': 'warn' },
  },
];
