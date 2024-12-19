module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/typescript', '@clerk/custom/react'],
  settings: {
    'import/ignore': ['node_modules/react-native/index\\.js$'],
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['node:*'],
      },
    ],
  },
};
