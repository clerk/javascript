module.exports = {
  root: true,
  ignorePatterns: ['!.*.js', '*.snap', 'templates/**'],
  extends: ['custom/node', 'custom/typescript', 'custom/playwright'],
  overrides: [
    {
      files: ['./models/deployment.ts', './testUtils/emailService.ts'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // TODO: Remove when we able to update tests
      },
    },
  ],
};
