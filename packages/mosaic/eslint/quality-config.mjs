import e18e from '@e18e/eslint-plugin';
import tseslint from 'typescript-eslint';

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
    plugins: { e18e },
    rules: {
      'e18e/no-spread-in-reduce': 'warn',
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
      '@stylexjs/valid-styles': [
        'error',
        {
          propLimits: {
            marginTop: { limit: null, reason: 'Use marginBlockStart instead.' },
            marginBottom: { limit: null, reason: 'Use marginBlockEnd instead.' },
            paddingTop: { limit: null, reason: 'Use paddingBlockStart instead.' },
            paddingBottom: { limit: null, reason: 'Use paddingBlockEnd instead.' },
          },
        },
      ],
    },
  },
];
