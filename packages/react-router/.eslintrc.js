module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/jest', '@clerk/custom/react'],
  overrides: [
    {
      files: ['./src/client/RemixOptionsContext.tsx'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      },
    },
  ],
};
