// All imports must be accounted for per `npm i` in .github/workflows/pr-title-linter.yml
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const getPackageNames = () => {
  const packagesDir = './packages';
  const entries = readdirSync(packagesDir);
  const packageNames = entries
    .filter(entry => {
      const fullPath = join(packagesDir, entry);
      return statSync(fullPath).isDirectory();
    })
    .flatMap(dir => {
      const packageJsonPath = join(packagesDir, dir, 'package.json');
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const name = packageJson.name.split('/').pop() as string;
        return [name, name.replace('clerk-', '')];
      } catch {
        // Ignore directories without a package.json
        return null;
      }
    })
    .filter(Boolean);
  return packageNames;
};

// Common camelCase terms that should be allowed in commit subjects
export const ALLOWED_CAMEL_CASE_TERMS = [
  'className',
  'forEach',
  'getElementById',
  'innerHTML',
  'localStorage',
  'onChange',
  'onClick',
  'sessionStorage',
  'useCallback',
  'useContext',
  'useEffect',
  'useId',
  'useMemo',
  'useReducer',
  'useRef',
  'useState',
];

export const CAMEL_CASE_PATTERN = new RegExp(`\\b(${ALLOWED_CAMEL_CASE_TERMS.join('|')})\\b`);

const Configuration = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit: string) => CAMEL_CASE_PATTERN.test(commit)],
  rules: {
    'body-max-line-length': [1, 'always', '150'],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', [...getPackageNames(), 'repo', 'release', 'e2e', '*', 'ci']],
    'subject-case': [2, 'always', ['lower-case', 'sentence-case']],
  },
};

export default Configuration;
