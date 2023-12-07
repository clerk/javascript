const { ECMA_VERSION, JAVASCRIPT_FILES } = require('./_constants');

// See: https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

/**
 * This is the base for both our browser and Node ESLint config files.
 */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'prettier',
    'turbo',
    require.resolve('./rules/variables'),
  ],
  plugins: ['simple-import-sort', 'unused-imports'],
  env: {
    [`es${ECMA_VERSION}`]: true,
  },
  reportUnusedDisableDirectives: true, // Report unused `eslint-disable` comments.
  ignorePatterns: ['!.*.js', '*.snap'], // Tell ESLint not to ignore dot-files, which are ignored by default.
  settings: {
    'import/resolver': { node: {} }, // Use the Node resolver by default.
  },
  parserOptions: {
    ecmaVersion: ECMA_VERSION,
    sourceType: 'module',
  },
  rules: {
    'simple-import-sort/imports': 'error',
    curly: 'error',
  },
  overrides: [
    {
      files: JAVASCRIPT_FILES,
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
};
