module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/jest'],
  rules: {
    // allowList all environment variables since we don't use Turborepo for clerk-dev anyway.
    'turbo/no-undeclared-env-vars': ['error', { allowList: ['.*'] }],
  },
};
