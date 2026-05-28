import { OptionDefaults } from 'typedoc';

const CUSTOM_BLOCK_TAGS = [
  '@unionReturnHeadings',
  '@displayFunctionSignature',
  '@paramExtension',
  '@experimental',
  '@hideReturns',
];

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
  typeAliasPropertiesFormat: 'table',
  useHTMLAnchors: false,
  tableColumnSettings: {
    hideSources: true,
    hideModifiers: true,
    hideDefaults: true,
    hideInherited: true,
    hideOverrides: true,
  },
  fileExtension: '.mdx',
  excludeScopesInPaths: true,
  expandObjects: true,
  formatWithPrettier: true,
  expandParameters: true,
};

/** @type {import("typedoc-plugin-replace-text").Config} */
const typedocPluginReplaceTextOptions = {
  replaceText: {
    replacements: [
      {
        /**
         * Inside our JSDoc comments we have absolute links to our docs, e.g. [Foo](https://clerk.com/docs/bar).
         * We want to replace these with relative links, e.g. [Foo](/docs/bar).
         */
        pattern: /https:\/\/clerk\.com\/docs/,
        replace: '/docs',
        flags: 'g',
      },
      {
        /**
         * Sometimes we need to add ```empty``` to an @example so that it's properly rendered (but we don't want to show a codeblock). This removes these placeholders.
         */
        pattern: /```empty```/,
        replace: '',
      },
      {
        /**
         * In order to not render `<Tabs>` in the inline IntelliSense, the `items` prop was adjusted from `items={['item', 'item2']}` to `items='item,item2'`. It needs to be converted back so that clerk.com can render it properly.
         */
        pattern: /Tabs items='([^']+)'/,
        replace: (_, match) =>
          `Tabs items={[${match
            .split(',')
            .map(item => `'${item.trim()}'`)
            .join(', ')}]}`,
      },
    ],
  },
};

/** @type {import("typedoc").TypeDocOptions} */
const config = {
  out: './.typedoc/temp-docs',
  entryPointStrategy: 'packages',
  plugin: [
    'typedoc-plugin-replace-text',
    'typedoc-plugin-markdown',
    './.typedoc/custom-router.mjs',
    './.typedoc/custom-theme.mjs',
    './.typedoc/custom-plugin.mjs',
    /** Must load after custom-plugin.mjs so its END listener (link replacements) fires first. */
    './.typedoc/extract-methods.mjs',
  ],
  theme: 'clerkTheme',
  router: 'clerk-router',
  readme: 'none',
  notRenderedTags: [
    ...OptionDefaults.notRenderedTags,
    ...CUSTOM_BLOCK_TAGS,
    /** Parsed for router/theme; must not appear as a doc section (otherwise renders as **Inline**). */
    '@inline',
    '@inlineType',
    /** Opts into a dedicated reference page despite `@inline` (see `.typedoc/standalone-page-tag.mjs`). */
    '@standalonePage',
  ],
  packageOptions: {
    includeVersion: false,
    excludePrivate: true,
    sortEntryPoints: true,
    sort: 'alphabetical',
    excludeExternals: true,
    excludeInternal: true,
    excludeNotDocumented: true,
    gitRevision: 'main',
    blockTags: [...OptionDefaults.blockTags, ...CUSTOM_BLOCK_TAGS],
    modifierTags: [
      ...OptionDefaults.modifierTags.filter(tag => tag !== '@experimental'),
      /** Suppresses the Parameters table in `.typedoc/extract-methods.mjs` method MDX. */
      '@skipParametersSection',
      /**
       * On a reference-object property whose value is an inline object type: omit the parent from the main Properties table;
       * extract each callable member as `methods/<parent>-<child>.mdx` and each non-callable object member as a nested heading + property table (see `.typedoc/extract-methods.mjs`).
       */
      '@extractMethods',
      /** Type-only / router hints; not user-facing prose (see `notRenderedTags`). */
      '@inline',
      '@inlineType',
      /** With `@inline`, still emit a standalone `.mdx` page (see `.typedoc/standalone-page-tag.mjs`). */
      '@standalonePage',
      /** Self-documenting placeholder for declarations intentionally left without a description. */
      '@generateWithEmptyComment',
    ],
    /**
     * Keep `@inline` / `@inlineType` / `@standalonePage` in the model so the custom router and theme can read them.
     */
    excludeTags: OptionDefaults.excludeTags.filter(
      tag => tag !== '@inline' && tag !== '@inlineType' && tag !== '@standalonePage',
    ),
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    readme: 'none',
    disableGit: true,
    disableSources: true,
    ...typedocPluginReplaceTextOptions,
  },
  entryPoints: ['packages/backend', 'packages/nextjs', 'packages/react', 'packages/shared'],
  ...typedocPluginMarkdownOptions,
};

export default config;
