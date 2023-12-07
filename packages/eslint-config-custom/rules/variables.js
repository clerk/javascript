module.exports = {
  rules: {
    'no-label-var': 'error',
    'no-undef-init': 'warn',
    'no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'unused-imports/no-unused-imports': 'error',
  },
};
