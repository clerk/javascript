import path from 'node:path';
import fs from 'node:fs';
import { OptionDefaults } from 'typedoc';

const IGNORE_LIST = [
  '.DS_Store',
  'dev-cli',
  'expo-passkeys',
  'tailwindcss-transformer',
  'testing',
  'themes',
  'ui',
  'upgrade',
];

/**
 * Return an array of relative paths to all folders in the "packages" folder to be used for the "entryPoints" option.
 */
function getPackages() {
  const packagesDir = path.resolve('packages');
  const packages = fs.readdirSync(packagesDir);

  return packages.filter(dir => !IGNORE_LIST.includes(dir)).map(dir => path.join('packages', dir));
}

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  out: './.typedoc/docs',
  // TODO: Once we're happy with the output the JSON should be written to a non-gitignored location as we want to consume it in other places
  json: './.typedoc/output.json',
  entryPointStrategy: 'packages',
  plugin: ['typedoc-plugin-markdown'],
  packageOptions: {
    includeVersion: false,
    excludePrivate: true,
    sortEntryPoints: true,
    sort: 'alphabetical',
    excludeExternals: true,
    excludeInternal: true,
    excludeNotDocumented: true,
    gitRevision: 'main',
    blockTags: [...OptionDefaults.blockTags, '@warning', '@note', '@important', '@memberof'],
    modifierTags: [...OptionDefaults.modifierTags],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    readme: 'none',
    disableGit: true,
    disableSources: true,
  },
  entryPoints: ['packages/nextjs', 'packages/react', 'packages/shared', 'packages/types'], // getPackages(),
  /**
   * typedoc-plugin-markdown options
   */
  hidePageHeader: true,
  hideBreadcrumbs: true,
};

export default config;
