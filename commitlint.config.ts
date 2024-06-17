// All imports must be accounted for per `npm i` in .github/workflows/pr-title-linter.yml
import { globbySync } from 'globby';
import { readFileSync } from 'node:fs';

const getPackageNames = () => {
  const files = globbySync('./packages/*/package.json');
  const names = files.map(f => JSON.parse(readFileSync(f, 'utf8')).name as string);
  return names.map(n => n.split('/').pop());
};

const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case']],
    'body-max-line-length': [1, 'always', '150'],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', [...getPackageNames(), 'repo', 'release', 'e2e', '*']],
  },
};

export default Configuration;
