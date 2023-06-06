const glob = require('glob');
const fs = require('fs');

const getPackageNames = () => {
  const files = glob.sync('./packages/*/package.json');
  const names = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')).name);
  return names.map(n => n.split('/').pop());
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case']],
    'body-max-line-length': [1, 'always', '150'],
    'scope-empty': [2, 'never'],
    'scope-enum': async ctx => [2, 'always', [...getPackageNames(), 'repo', 'release']],
  },
};
