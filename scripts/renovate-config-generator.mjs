import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fs from 'fs-extra';
import JSON5 from 'json5';
import { glob } from 'tinyglobby';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const rules = new Map();

/**
 * @typedef PackageRule
 * @property {string} [groupName]
 * @property {string} [commitMessageTopic]
 * @property {string} [groupSlug]
 * @property {string[]} [matchFileNames]
 * @property {string[]} [matchUpdateTypes]
 * @property {string[]} [matchDepTypes]
 * @property {string[]} [matchPackageNames]
 * @property {string[]} [matchPackagePatterns]
 * @property {boolean} [automerge]
 * @property {boolean} [dependencyDashboardApproval]
 * @property {string} [additionalBranchPrefix]
 * @property {boolean} [enabled]
 */

/**
 * @type {Array.<PackageRule>}
 */
const defaultRules = [
  {
    matchManagers: ['npm'],
    matchDepTypes: ['engines'],
    matchPackageNames: ['node'],
    enabled: false,
  },
  // Don't bump @clerk/ packages since changesets will handle this
  {
    matchPackagePatterns: ['^@clerk/'],
    enabled: false,
  },
  {
    groupName: 'Clerk monorepo',
    groupSlug: 'clerk-monorepo',
    matchFileNames: ['+(package.json)'],
    matchDepTypes: ['devDependencies'],
    matchUpdateTypes: ['major', 'minor', 'patch'],
    dependencyDashboardApproval: false,
    commitMessageTopic: 'Dependencies for Clerk Monorepo',
  },
  {
    groupName: 'ESLint',
    matchPackageNames: [
      '@eslint/{/,}**',
      '@types/eslint',
      '@stylistic/eslint-plugin{/,}**',
      '@types/eslint__{/,}**',
      '@typescript-eslint/{/,}**',
      'eslint{/,}**',
      'typescript-eslint{/,}**',
    ],
  },
  {
    groupName: 'linting & formatting',
    matchPackageNames: [
      'prettier',
      'publint',
      '@arethetypeswrong/cli',
      '@commitlint/cli',
      '@commitlint/config-conventional',
    ],
  },
  {
    groupName: 'testing',
    matchPackageNames: [
      '@types/chai',
      '@types/jest',
      '@types/sinon',
      'nock',
      'nyc',
      'ts-jest',
      'vitest',
      '@testing-library{/,}**',
      '@types/testing-library__{/,}**',
      '@vitest{/,}**',
      'chai{/,}**',
      'jest{/,}**',
      'qunit{/,}**',
      'should{/,}**',
      'sinon{/,}**',
      '@playwright{/,}**',
    ],
  },
  {
    groupName: 'TypeScript',
    matchPackageNames: ['typescript'],
    rangeStrategy: 'bump',
  },
  {
    groupName: 'common TypeScript types',
    matchPackageNames: ['@types/node'],
    rangeStrategy: 'bump',
  },
  {
    extends: ['monorepo:remix'],
    groupName: 'Remix monorepo',
    matchUpdateTypes: ['patch', 'minor', 'major'],
  },
];

const getPackageNames = async () => {
  const files = await glob('./packages/*/package.json', { cwd: ROOT_DIR });
  let names = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const json = JSON.parse(content);
    names.push(json.name.split('/').pop());
  }

  // Sort alphabetically to make the output stable
  return names.sort();
};

const packageNames = await getPackageNames();

for (const pkg of packageNames) {
  /**
   * @type {Array.<PackageRule>}
   */
  const pkgRules = [
    {
      groupName: `[DEV] minor & patch dependencies`,
      groupSlug: `${pkg}-dev-minor`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      automerge: true,
      semanticCommitScope: pkg,
    },
    {
      groupName: `[DEV] major dependencies`,
      groupSlug: `${pkg}-dev-major`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`major`],
      semanticCommitScope: pkg,
    },
    {
      groupName: `minor & patch dependencies`,
      groupSlug: `${pkg}-prod-minor`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      semanticCommitScope: pkg,
    },
    {
      groupName: `major dependencies`,
      groupSlug: `${pkg}-prod-major`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`major`],
      semanticCommitScope: pkg,
    },
  ];

  rules.set(pkg, pkgRules);
}

const renovateConfig = {
  commitMessageLowerCase: 'never',
  extends: [
    ':combinePatchMinorReleases',
    ':dependencyDashboard',
    ':disablePeerDependencies',
    ':enableVulnerabilityAlerts',
    ':ignoreModulesAndTests',
    ':ignoreUnstable',
    ':label(dependencies)',
    ':maintainLockFilesDisabled',
    ':prImmediately',
    ':semanticPrefixFixDepsChoreOthers',
    ':separateMajorReleases',
    'group:monorepos',
    'group:recommended',
  ],
  ignorePaths: ['**/node_modules/**', '.nvmrc', 'integration/templates/**', 'playground/**'],
  includePaths: ['package.json', 'packages/**', 'pnpm-workspace.yaml'],
  major: { dependencyDashboardApproval: true },
  minimumReleaseAge: '3 days',
  nvm: { enabled: false },
  packageRules: Array.from(rules.values()).flat().concat(defaultRules),
  postUpdateOptions: ['pnpmDedupe'],
  prConcurrentLimit: 16,
  prCreation: 'immediate',
  prHourlyLimit: 4,
  rangeStrategy: 'bump',
  schedule: ['before 7am on the first day of the week'],
  semanticCommitScope: 'repo',
  timezone: 'GMT',
  updateNotScheduled: false,
};

await fs.writeFile(
  path.join(ROOT_DIR, 'renovate.json5'),
  '// This file is automatically generated. Do not edit directly but run the "renovate-config-generator.mjs" script.\n' +
    JSON5.stringify(renovateConfig, { quote: `"`, space: 2 }),
);
