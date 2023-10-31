module.exports = {
  root: true,
  extends: ['custom/browser', 'custom/typescript', 'custom/jest', 'custom/react'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^#'] }],
  },
  overrides: [
    {
      files: ['./src/client-boundary/NextOptionsContext.tsx'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      },
    },
  ],
};
