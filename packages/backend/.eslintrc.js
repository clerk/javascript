module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/typescript', '@clerk/custom/qunit'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^#'] }],
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        // TODO: It's an issue specific to QUnit tests
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      },
    },
  ],
};
