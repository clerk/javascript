module.exports = {
  root: true,
  extends: ['custom/node', 'custom/typescript', 'custom/qunit'],
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
