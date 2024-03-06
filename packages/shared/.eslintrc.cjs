module.exports = {
  root: true,
  extends: ['custom/browser', 'custom/typescript', 'custom/jest', 'custom/react'],
  ignorePatterns: ['jest.config.js'],
  overrides: [
    {
      files: ['./src/utils/globs.ts'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      },
    },
  ],
};
