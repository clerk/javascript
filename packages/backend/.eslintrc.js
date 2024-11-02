module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/typescript'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^#'] }],
  },
};
