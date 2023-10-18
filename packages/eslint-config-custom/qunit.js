const disabledRules = {
  'qunit/no-assert-equal': 'off',
};

module.exports = {
  extends: ['plugin:qunit/recommended'],
  env: {
    qunit: true,
  },
  rules: {
    'qunit/no-assert-equal-boolean': 'warn',
    'qunit/no-assert-equal': 'warn',
    'qunit/no-conditional-assertions': 'warn',
    'qunit/no-early-return': 'warn',
    ...disabledRules,
  },
};
