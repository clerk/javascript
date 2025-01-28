import path from 'node:path';
import fs from 'node:fs';
import { OptionDefaults } from 'typedoc';

const IGNORE_LIST = [
  '.DS_Store',
  'dev-cli',
  'expo-passkeys',
  'tailwind-css-transformer',
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
  excludePrivate: true,
  blockTags: [...OptionDefaults.blockTags, '@warning', '@note', '@important'],
  modifierTags: [...OptionDefaults.modifierTags],
  exclude: ['**/*+(.spec|.test).ts'],
  plugin: ['typedoc-plugin-missing-exports'],
  packageOptions: {
    includeVersion: false,
    excludePrivate: true,
    sortEntryPoints: true,
    sort: 'alphabetical',
    excludeExternals: true,
    excludeInternal: true,
    excludeNotDocumented: true,
    gitRevision: 'main',
  },
  entryPoints: getPackages(),
};

export default config;
