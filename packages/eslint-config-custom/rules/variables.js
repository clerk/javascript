module.exports = {
  rules: {
    'no-label-var': 'error',
    'no-undef-init': 'warn',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: false,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
