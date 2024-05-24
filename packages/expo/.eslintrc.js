module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/typescript', '@clerk/custom/jest', '@clerk/custom/react'],
  settings: {
    'import/ignore': ['node_modules/react-native/index\\.js$'],
  },
};
