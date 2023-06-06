module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['../../tsconfig.eslint.json'],
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    // Incompatible with latest version of eslint,
    // disabled until this is fixed: https://github.com/vercel/turbo/issues/4469
    // 'turbo',
  ],
  rules: {
    curly: 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'separate-type-imports',
      },
    ],
    'simple-import-sort/imports': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@emotion/*'],
            message:
              'Please do not import emotion directly. Import helpers from ./design-system or ./primitives instead.',
          },
        ],
      },
    ],
  },
};
