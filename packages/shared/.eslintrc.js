module.exports = {
  root: true,
  extends: ['custom/browser', 'custom/typescript', 'custom/jest', 'custom/react'],
  overrides: [
    {
      files: ['./src/utils/globs.ts'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      },
    },
  ],
};
