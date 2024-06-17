module.exports = {
  root: true,
  extends: ['@clerk/custom/typescript', '@clerk/custom/jest'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^~/'] }],
  },
  // overrides: [],
};
