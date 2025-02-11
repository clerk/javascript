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
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ECMA_VERSION = 2021,
  JAVASCRIPT_FILES = ['**/*.cjs', '**/*.js', '**/*.jsx', '**/*.mjs'],
  TEST_FILES = ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx', '**/test/**', '**/__tests__/**'],
  TYPESCRIPT_FILES = ['**/*.cts', '**/*.mts', '**/*.ts', '**/*.tsx'];

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
      // Making this rule an error to see if we can catch any issues
      '@typescript-eslint/no-non-null-assertion': 'error',

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
    name: 'packages/ui',
    files: ['packages/ui/src/**/*'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^#', '^~', '@clerk/elements/*'] }],
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
  ...pluginYml.configs['flat/recommended'],
  {
    name: 'repo/.github',
    // rules: {
    // 'regex/invalid': [
    //   'error',
    //   [
    //     {
    //       regex: '^(?!.*\\$TURBO_ARGS( |$)).*turbo \\S+',
    //       message: 'Invalid turbo CI command. Must contain `$TURBO_ARGS`',
    //     },
    //   ],
    // ],
    // },
  },

  configPrettier,
]);
