module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/jest', '@clerk/custom/react'],
  rules: {
    'jest/no-test-prefixes': 'warn', // TODO: Remove this once we've fixed all the tests
    'turbo/no-undeclared-env-vars': ['error', { allowList: ['RSDOCTOR'] }],
  },
};
