// TODO: All rules below should be set to their defaults
// when we're able to make the appropriate changes.
const disabledRules = {
  'playwright/expect-expect': 'off',
  'playwright/no-skipped-test': 'off',
  'playwright/no-page-pause': 'warn',
};

module.exports = {
  root: true,
  ignorePatterns: ['!.*.js', '*.snap', 'templates/**'],
  extends: ['@clerk/custom/node', '@clerk/custom/typescript', '@clerk/custom/playwright'],
  rules: {
    ...disabledRules,
  },
  overrides: [
    {
      files: ['./models/deployment.ts', './testUtils/emailService.ts'],
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // TODO: Remove when we able to update tests
      },
    },
    {
      files: ['./testUtils/testAgainstRunningApps.ts', './presets/longRunningApps.ts'],
      rules: {
        '@typescript-eslint/no-redundant-type-constituents': 'warn', // TODO: Remove when we able to update tests
      },
    },
    {
      rules: {
        'turbo/no-undeclared-variables': 'off',
      },
    },
  ],
};
