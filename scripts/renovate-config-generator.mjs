import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fs from 'fs-extra';
import { globby } from 'globby';

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
    groupName: 'Clerk Monorepo',
    groupSlug: 'clerk-monorepo',
    matchFileNames: ['+(package.json)'],
    matchDepTypes: ['devDependencies'],
    matchUpdateTypes: ['major', 'minor', 'patch'],
    dependencyDashboardApproval: false,
    commitMessageTopic: 'Dependencies for Clerk Monorepo',
  },
  {
    groupName: 'Linting & Formatting',
    matchPackageNames: [
      '@types/eslint',
      'prettier',
      'publint',
      '@arethetypeswrong/cli',
      '@commitlint/cli',
      '@commitlint/config-conventional',
    ],
    matchPackagePrefixes: ['@eslint/', '@stylistic/eslint-plugin', '@types/eslint__', '@typescript-eslint/', 'eslint'],
  },
  {
    groupName: 'Testing',
    matchPackageNames: ['@types/chai', '@types/jest', '@types/sinon', 'nock', 'nyc', 'ts-jest', 'vitest'],
    matchPackagePrefixes: [
      '@testing-library',
      '@types/testing-library__',
      '@vitest',
      'chai',
      'jest',
      'qunit',
      'should',
      'sinon',
      '@playwright',
    ],
  },
  {
    groupName: 'TypeScript',
    matchPackageNames: ['typescript'],
    rangeStrategy: 'bump',
  },
  {
    groupName: 'Common TypeScript Types',
    matchPackageNames: ['@types/node', '@types/react', '@types/react-dom'],
    rangeStrategy: 'bump',
  },
  {
    groupName: 'React',
    matchPackageNames: ['react', 'react-dom'],
    rangeStrategy: 'bump',
  },
  {
    extends: ['monorepo:remix'],
    groupName: 'Remix Monorepo',
    matchUpdateTypes: ['patch', 'minor', 'major'],
  },
];

const globbed = await globby('packages/*', { cwd: ROOT_DIR, onlyDirectories: true });
const workspacePackages = globbed.map(p => p.split('/').pop());

for (const pkg of workspacePackages) {
  /**
   * @type {Array.<PackageRule>}
   */
  const pkgRules = [
    {
      groupName: `[DEV] Minor & patch dependencies`,
      groupSlug: `${pkg}-dev-minor`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      automerge: true,
      semanticCommitScope: pkg,
    },
    {
      groupName: `[DEV] Major dependencies`,
      groupSlug: `${pkg}-dev-major`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`devDependencies`],
      matchUpdateTypes: [`major`],
      semanticCommitScope: pkg,
    },
    {
      groupName: `Minor & patch dependencies`,
      groupSlug: `${pkg}-prod-minor`,
      matchFileNames: [`packages/${pkg}/package.json`],
      matchDepTypes: [`dependencies`],
      matchUpdateTypes: [`patch`, `minor`],
      semanticCommitScope: pkg,
    },
    {
      groupName: `Major dependencies`,
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
  extends: [
    ':separateMajorReleases',
    ':combinePatchMinorReleases',
    ':ignoreUnstable',
    ':disablePeerDependencies',
    ':maintainLockFilesDisabled',
    ':label(dependencies)',
    ':dependencyDashboard',
    ':enableVulnerabilityAlerts',
    ':ignoreModulesAndTests',
    ':prImmediately',
    ':semanticPrefixFixDepsChoreOthers',
  ],
  includePaths: ['package.json', 'packages/**', 'integration/templates/**'],
  ignorePaths: ['**/node_modules/**', '.nvmrc'],
  nvm: {
    enabled: false,
  },
  minimumReleaseAge: '3 days',
  timezone: 'GMT',
  schedule: ['before 7am on the first day of the month'],
  prCreation: 'immediate',
  updateNotScheduled: false,
  major: {
    dependencyDashboardApproval: true,
  },
  rangeStrategy: 'auto',
  prHourlyLimit: 4,
  prConcurrentLimit: 16,
  postUpdateOptions: ['npmDedupe'],
  semanticCommitScope: 'repo',
  commitMessageLowerCase: 'never',
  packageRules: Array.from(rules.values()).flat().concat(defaultRules),
};

await fs.writeFile(
  path.join(ROOT_DIR, 'renovate.json5'),
  '// This file is automatically generated. Do not edit directly but run the "renovate-config-generator.mjs" script.\n' +
    JSON.stringify(renovateConfig, null, 2),
);
