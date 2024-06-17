module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/jest', '@clerk/custom/react'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^~/'] }],
  },
  // overrides: [],
};
