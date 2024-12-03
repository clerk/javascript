module.exports = {
  root: true,
  extends: ['@clerk/custom/browser', '@clerk/custom/typescript', '@clerk/custom/jest'],
  rules: {
    'import/named': 'warn',
  },
};
