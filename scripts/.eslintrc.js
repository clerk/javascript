module.exports = {
  root: true,
  extends: ['custom/node', 'custom/typescript'],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['^#'] }],
  },
};
