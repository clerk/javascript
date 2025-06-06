import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import configTurbo from 'eslint-config-turbo/flat';
import pluginImport from 'eslint-plugin-import';
import pluginJest from 'eslint-plugin-jest';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPlaywright from 'eslint-plugin-playwright';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginTurbo from 'eslint-plugin-turbo';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import pluginYml from 'eslint-plugin-yml';
import pluginJsDoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ECMA_VERSION = 2021,
  JAVASCRIPT_FILES = ['**/*.cjs', '**/*.js', '**/*.jsx', '**/*.mjs'],
  TEST_FILES = ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx', '**/test/**', '**/__tests__/**'],
  TYPESCRIPT_FILES = ['**/*.cts', '**/*.mts', '**/*.ts', '**/*.tsx'];

const noNavigateUseClerk = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow any usage of `navigate` from `useClerk()`',
      recommended: false,
    },
    messages: {
      noNavigate:
        'Usage of `navigate` from `useClerk()` is not allowed.\nUse `useRouter().navigate` to navigate in-between flows or `setActive({ redirectUrl })`.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      // Case 1: Destructuring `navigate` from `useClerk()`
      VariableDeclarator(node) {
        if (
          node.id.type === 'ObjectPattern' && // Checks if it's an object destructuring
          node.init?.type === 'CallExpression' &&
          node.init.callee.name === 'useClerk'
        ) {
          for (const property of node.id.properties) {
            if (property.type === 'Property' && property.key.name === 'navigate') {
              context.report({
                node: property,
                messageId: 'noNavigate',
              });
            }
          }
        }
      },

      // Case 2 & 3: Accessing `navigate` on a variable or directly calling `useClerk().navigate`
      MemberExpression(node) {
        if (
          node.property.name === 'navigate' &&
          node.object.type === 'CallExpression' &&
          node.object.callee.name === 'useClerk'
        ) {
          // Case 3: Direct `useClerk().navigate`
          context.report({
            node,
            messageId: 'noNavigate',
          });
        } else if (node.property.name === 'navigate' && node.object.type === 'Identifier') {
          // Case 2: `clerk.navigate` where `clerk` is assigned `useClerk()`
          const scope = sourceCode.scopeManager.acquire(node);
          if (!scope) return;

          const variable = scope.variables.find(v => v.name === node.object.name);

          if (
            variable?.defs?.[0]?.node?.init?.type === 'CallExpression' &&
            variable.defs[0].node.init.callee.name === 'useClerk'
          ) {
            context.report({
              node,
              messageId: 'noNavigate',
            });
          }
        }
      },
    };
  },
};

export default tseslint.config([
  {
    name: 'repo/ignores',
    ignores: [
      '.cache',
      '.idea',
      '.next',
      '.turbo',
      '.vscode',
      '.yalc',
      '!.*.js',
      '**/.turbo/*',
      '**/build/*',
      '**/coverage/*',
      '**/dist/*',
      '**/integration/templates/**/*',
      '**/node_modules/**',
      '*.snap',
      'commitlint.config.ts',
      'packages/*/dist/**',
      'packages/*/examples',
      'playground/*',
      'pnpm-lock.json',
      'eslint.config.mjs',
      'typedoc.config.mjs',
      'vitest.workspace.mjs',
      // package specific ignores
      'packages/astro/src/astro-components/**/*.ts',
      'packages/backend/src/runtime/**/*',
      'packages/clerk-js/rspack.config.js',
      'packages/shared/src/compiled/path-to-regexp/index.js',
    ],
  },
  {
    name: 'repo/react-settings',
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    name: 'repo/language-options',
    languageOptions: {
      ecmaVersion: ECMA_VERSION,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
  },
  {
    name: 'repo/linter-options',
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  ...configTurbo,
  pluginImport.flatConfigs.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  pluginReact.configs.flat.recommended,
  {
    name: 'repo/global',
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
      'unused-imports': pluginUnusedImports,
      turbo: pluginTurbo,
    },
    settings: {
      'import/ignore': ['node_modules/react-native/index\\.js$'],
      'import/resolver': {
        node: true,
        typescript: {
          alwaysTryTypes: true,
          project: ['packages/*/tsconfig.json', 'integration/tsconfig.json'],
        },
      },
    },
    rules: {
      curly: ['error', 'all'],
      'no-label-var': 'error',
      'no-undef-init': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              message: "Please always import from '@clerk/shared/<module>' instead of '@clerk/shared'.",
              name: '@clerk/shared',
            },
          ],
          patterns: [
            {
              group: ['!@clerk/shared/*'],
              message: 'ignore this line -- eslint matching workaround to allow all imports except @clerk/shared',
            },
            {
              group: ['@emotion/*'],
              message:
                'Please do not import emotion directly. Import helpers from ./design-system or ./primitives instead.',
            },
          ],
        },
      ],

      'jsx-a11y/no-onchange': 'off',

      'react/button-has-type': 'warn',
      'react/function-component-definition': 'off',
      'react/hook-use-state': 'warn',
      'react/jsx-boolean-value': 'warn',
      'react/jsx-curly-brace-presence': 'warn',
      'react/jsx-fragments': 'warn',
      'react/jsx-no-leaked-render': 'warn',
      'react/jsx-no-target-blank': [
        'error',
        {
          allowReferrer: true,
        },
      ],
      'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
      'react/jsx-pascal-case': 'warn',
      'react/jsx-sort-props': 'warn',
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'warn',
      'react/no-unknown-property': ['error', { ignore: ['css'] }], // Emotion
      'react/self-closing-comp': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      'simple-import-sort/imports': 'error',

      'sort-imports': 'off',

      ...pluginTurbo.configs['flat/recommended'].rules,

      'unused-imports/no-unused-imports': 'error',

      // TYPESCRIPT RULE DISABLES
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    name: 'repo/global-temporary',
    rules: {
      // TODO: All rules below should be set to their defaults
      // when we're able to make the appropriate changes.
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        `warn`,
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-check': 'allow-with-description',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-floating-promises': [
        'warn',
        {
          ignoreVoid: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/require-await': 'warn',

      // FIXME: This rule should be enabled when we're able to support import aliases
      'import/no-unresolved': ['error', { ignore: ['^#', '^~'] }],

      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/html-has-lang': 'warn',
      'jsx-a11y/no-autofocus': 'warn',

      'react/button-has-type': 'warn',
      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/jsx-no-leaked-render': 'off',
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-sort-props': 'off',
    },
  },
  {
    name: 'repo/javascript',
    files: JAVASCRIPT_FILES,
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    name: 'repo/typescript',
    files: TYPESCRIPT_FILES,
    extends: [pluginImport.flatConfigs.recommended, pluginImport.flatConfigs.typescript],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    name: 'repo/test',
    files: TEST_FILES,
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    plugins: {
      jest: pluginJest,
    },
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error',
    },
  },
  {
    name: 'repo/react-hooks',
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
  {
    name: 'packages/clerk-js',
    files: ['packages/clerk-js/src/ui/**/*'],
    plugins: {
      'custom-rules': {
        rules: {
          'no-navigate-useClerk': noNavigateUseClerk,
        },
      },
    },
    rules: {
      'custom-rules/no-navigate-useClerk': 'error',
    },
  },
  {
    name: 'packages/expo-passkeys',
    files: ['packages/expo-passkeys/src/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['node:*'],
        },
      ],
    },
  },
  {
    name: 'packages/nextjs',
    files: ['packages/nextjs/src/**/*'],
    rules: {
      'turbo/no-undeclared-env-vars': [
        'error',
        {
          allowList: ['_NEXT_ROUTER_BASEPATH'],
        },
      ],
    },
  },
  {
    name: 'packages/upgrade',
    files: ['packages/upgrade/src/**/*'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^#', '^~', '@inkjs/ui', '^ink'] }],
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  {
    name: 'repo/integration',
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['integration/tests/**'],
    rules: {
      ...pluginPlaywright.configs['flat/recommended'].rules,
      'playwright/expect-expect': 'off',
      'playwright/no-skipped-test': 'off',
      'playwright/no-page-pause': 'warn',
    },
  },
  {
    name: 'repo/scripts',
    files: ['scripts/**/*'],
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
  {
    name: 'repo/jsdoc',
    ...pluginJsDoc.configs['flat/recommended-typescript'],
    files: ['packages/shared/src/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**'],
    plugins: {
      jsdoc: pluginJsDoc,
    },
    rules: {
      ...pluginJsDoc.configs['flat/recommended-typescript'].rules,
      'jsdoc/check-examples': 'off',
      'jsdoc/informative-docs': 'warn',
      'jsdoc/check-tag-names': [
        'warn',
        { definedTags: ['inline', 'unionReturnHeadings', 'displayFunctionSignature', 'paramExtension'], typed: false },
      ],
      'jsdoc/require-hyphen-before-param-description': 'warn',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-description-complete-sentence': 'warn',
      'jsdoc/require-param': ['warn', { ignoreWhenAllParamsMissing: true }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': 'off',
      'jsdoc/tag-lines': [
        'warn',
        'always',
        { count: 1, applyToEndTag: false, startLines: 1, tags: { param: { lines: 'never' } } },
      ],
    },
  },
  ...pluginYml.configs['flat/recommended'],
  configPrettier,
]);
