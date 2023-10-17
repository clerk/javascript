module.exports = {
  root: true,
  extends: ['custom/browser', 'custom/typescript', 'custom/jest', 'custom/react'],
  rules: {
    'jest/no-test-prefixes': 'warn', // TODO: Remove this once we've fixed all the tests
  },
};
