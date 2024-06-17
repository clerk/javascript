module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/jest', '@clerk/custom/react'],
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
