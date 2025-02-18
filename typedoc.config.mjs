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

/** @type {import("typedoc-plugin-markdown").PluginOptions} */
const typedocPluginMarkdownOptions = {
  hidePageHeader: true,
  hideBreadcrumbs: true,
  hidePageTitle: true,
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  enumMembersFormat: 'table',
  propertyMembersFormat: 'table',
  typeDeclarationFormat: 'table',
  typeDeclarationVisibility: 'compact',
  useHTMLAnchors: false,
  tableColumnSettings: {
    hideSources: true,
  },
  fileExtension: '.mdx',
};

const frontmatterTags = ['description', 'title'];
const frontmatterBlockTags = frontmatterTags.map(tag => `@${tag}`);

/** @type {Partial<import("typedoc-plugin-frontmatter").PluginOptions>} */
const typedocPluginFrontmatterOptions = {
  frontmatterCommentTags: frontmatterTags,
  preserveFrontmatterCommentTags: false,
};

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  out: './.typedoc/docs',
  json: './.typedoc/docs.json',
  entryPointStrategy: 'packages',
  plugin: [
    'typedoc-plugin-markdown',
    'typedoc-plugin-frontmatter',
    './.typedoc/custom-theme.mjs',
    './.typedoc/custom-plugin.mjs',
  ],
  theme: 'clerkTheme',
  readme: 'none',
  packageOptions: {
    includeVersion: false,
    excludePrivate: true,
    sortEntryPoints: true,
    sort: 'alphabetical',
    excludeExternals: true,
    excludeInternal: true,
    excludeNotDocumented: true,
    gitRevision: 'main',
    blockTags: [...OptionDefaults.blockTags, ...frontmatterBlockTags, '@warning', '@note', '@important', '@memberof'],
    modifierTags: [...OptionDefaults.modifierTags],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    readme: 'none',
    disableGit: true,
    disableSources: true,
  },
  entryPoints: ['packages/nextjs', 'packages/react', 'packages/shared', 'packages/types'], // getPackages(),
  ...typedocPluginMarkdownOptions,
  ...typedocPluginFrontmatterOptions,
};

export default config;
