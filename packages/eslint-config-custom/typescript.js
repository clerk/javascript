const { resolve } = require('node:path');
const fs = require('node:fs');
const { TYPESCRIPT_FILES } = require('./_constants');
const requirePackage = require('./utils/require-package');
const noUnusedVarsConfig = require('./rules/variables').rules['no-unused-vars'];

requirePackage('typescript', 'typescript');

const cwd = process.cwd();

// Prefer tsconfig.lint.json, if it exists. Otherwise, use tsconfig.json.
let project = resolve(cwd, 'tsconfig.lint.json');

if (!fs.existsSync(project)) {
  project = resolve(cwd, 'tsconfig.json');
}

const disabledRules = {
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/no-unsafe-declaration-merging': 'off',

  // TODO: All rules below should be set to their defaults
  // when we're able to make the appropriate changes.
  '@typescript-eslint/await-thenable': 'warn',
  '@typescript-eslint/no-duplicate-type-constituents': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-misused-promises': 'warn',
  '@typescript-eslint/no-floating-promises': [
    'warn',
    {
      ignoreVoid: true,
    },
  ],
  '@typescript-eslint/no-redundant-type-constituents': 'warn',
  '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
  '@typescript-eslint/require-await': 'warn',
};

module.exports = {
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: TYPESCRIPT_FILES,
      extends: [
        require.resolve('./_base'),
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        '@typescript-eslint/ban-ts-comment': [
          `warn`,
          {
            'ts-ignore': 'allow-with-description',
            'ts-expect-error': 'allow-with-description',
            'ts-check': 'allow-with-description',
          },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            disallowTypeAnnotations: true,
            fixStyle: 'separate-type-imports',
          },
        ],
        '@typescript-eslint/no-floating-promises': [
          'error',
          {
            ignoreVoid: true,
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
        ...disabledRules,
      },
    },
  ],
};
