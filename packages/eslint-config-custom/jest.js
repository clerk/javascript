const { TEST_FILES } = require('./_constants');

const disabledRules = {
  'jest/prefer-lowercase-title': 'off',

  // TODO: All rules below should be set to their defaults
  // when we're able to make the appropriate changes.
  'jest/expect-expect': 'off',
  'jest/no-alias-methods': 'off',
  'jest/no-commented-out-tests': 'off',
  'jest/no-disabled-tests': 'off',
  'jest/no-conditional-expect': 'off',
  'jest/no-duplicate-hooks': 'off',
  'jest/no-export': 'off',
  'jest/no-identical-title': 'off',
  'jest/no-jasmine-globals': 'off',
  'jest/require-top-level-describe': 'off',
  'jest/unbound-method': 'off',
  'jest/valid-expect': 'off',
  'jest/valid-title': 'off',
};

// TODO: All rules below should be set to their defaults
// when we're able to make the appropriate changes.
const disabledOverrideRules = {
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/unbound-method': 'off',
};

module.exports = {
  extends: ['plugin:jest/recommended'],
  env: {
    jest: true,
  },
  rules: {
    ...disabledRules,
  },
  overrides: [
    {
      files: TEST_FILES,
      rules: {
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'off', // TODO: Set to `error` when we're able to make the appropriate changes.

        ...disabledOverrideRules,
      },
    },
  ],
};
