module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/react'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^~/'] }],
  },
  // overrides: [],
};
