const {
  utils: { getPackages },
} = require('@commitlint/config-lerna-scopes');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case']],
    'body-max-line-length': [1, 'always', '150'],
    'scope-empty': [2, 'never'],
    'scope-enum': async (ctx) => [
      2,
      'always',
      [...(await getPackages(ctx)), 'repo', 'release'],
    ],
  },
};
