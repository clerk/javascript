module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/react'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^#'] }],
  },
  ignorePatterns: [
    'src/astro-components/index.ts',
    'src/astro-components/interactive/UserButton/index.ts',
    'src/astro-components/interactive/UserProfile/index.ts',
  ],
  overrides: [
    {
      files: ['./env.d.ts'],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  ],
};
