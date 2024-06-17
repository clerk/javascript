module.exports = {
  root: true,
  extends: ['@clerk/custom/node', '@clerk/custom/react'],
  rules: { 'react/no-unescaped-entities': 0, 'import/no-unresolved': 0 },
  parserOptions: {
    babelOptions: {
      parserOpts: {
        plugins: ['jsx']
      }
    }
  }
};
