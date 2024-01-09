module.exports = {
  root: true,
  extends: ['custom/browser', 'custom/typescript', 'custom/jest', 'custom/react'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['^~/'] }],
  },
  // overrides: [],
};
