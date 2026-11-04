import path from 'node:path';

import noUnneededEffects from 'eslint-plugin-react-you-might-not-need-an-effect';
import { defineConfig } from 'oxlint';

import rootConfig from '../../oxlint.config.mts';

const mosaicRoot = import.meta.dirname;
const SHARED = ['primitives', 'icons', 'machine', 'utils', 'hooks', 'styles', 'components', 'localization', 'root'];
const FLOW_UI = { file: { categories: { anyOf: ['view', 'controller'] } } };
const CLERK_DATA_HOOKS = [
  'useClerk',
  'useUser',
  'useSession',
  'useSessionList',
  'useOrganization',
  'useOrganizationList',
  'useAuth',
];
const noLeakedConditionalJsx = {
  selector: ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > LogicalExpression[operator='&&']",
  message:
    'Use a ternary (`condition ? <Element /> : null`) for conditional JSX; `&&` renders a falsy left-hand value such as `0`.',
};

export default defineConfig({
  ...rootConfig,
  plugins: [...rootConfig.plugins, 'vitest'],
  jsPlugins: [
    ...rootConfig.jsPlugins,
    { name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' },
    { name: 'jsx-a11y-js', specifier: 'eslint-plugin-jsx-a11y' },
    { name: '@eslint-community/eslint-comments', specifier: '@eslint-community/eslint-plugin-eslint-comments' },
    { name: '@stylexjs', specifier: '@stylexjs/eslint-plugin' },
    'eslint-plugin-sonarjs',
    { name: 'mosaic', specifier: './eslint/plugin.mjs' },
    'eslint-plugin-boundaries',
    'eslint-plugin-react-you-might-not-need-an-effect',
  ],
  settings: {
    ...rootConfig.settings,
    'boundaries/root-path': mosaicRoot,
    'boundaries/flag-as-external': { outsideRootPath: true },
    'boundaries/elements': [
      ...['primitives', 'icons', 'machine', 'utils', 'hooks', 'styles', 'components', 'localization'].map(type => ({
        type,
        pattern: `src/${type}`,
        partialMatch: false,
      })),
      { type: 'queries', pattern: 'src/queries', partialMatch: false },
      { type: 'modals', pattern: 'src/modals', partialMatch: false },
      { type: 'blocks', pattern: 'src/blocks', partialMatch: false },
      { type: 'features', pattern: 'src/features/*', partialMatch: false, capture: ['feature'] },
      { type: 'root', pattern: 'src', partialMatch: false },
    ],
    'boundaries/files': [
      { category: 'view', pattern: '**/*.view.{ts,tsx}' },
      { category: 'controller', pattern: '**/*.controller.{ts,tsx}' },
      { category: 'model', pattern: '**/*.model.{ts,tsx}' },
      { category: 'messages', pattern: '**/*.messages.ts' },
      { category: 'css-entry', pattern: 'src/styles/index.ts' },
    ],
    'import/resolver': {
      node: true,
      typescript: {
        alwaysTryTypes: true,
        project: [
          path.join(import.meta.dirname, 'tsconfig.json'),
          path.join(import.meta.dirname, 'tsconfig.test.json'),
        ],
      },
    },
  },
  overrides: [
    ...rootConfig.overrides,
    {
      files: [
        'src/primitives/file-upload/file-upload-dropzone.tsx',
        'src/primitives/tag-input/tag-input-root.tsx',
        'src/primitives/menu/menu-positioner.tsx',
        'src/primitives/toast/toast-viewport.tsx',
        'src/primitives/toast/toast-positioner.tsx',
        'src/primitives/select/select-positioner.tsx',
        'src/primitives/select/select-trigger.tsx',
        'src/primitives/combobox/combobox-input.tsx',
        'src/primitives/table/table-row.tsx',
        'src/primitives/autocomplete/autocomplete-input.tsx',
        'src/features/switcher/switcher.view.tsx',
      ],
      rules: { 'react/refs': 'off', 'react-hooks-js/refs': 'error' },
    },
    {
      files: ['src/components/switch/switch.tsx'],
      rules: { 'jsx-a11y/role-has-required-aria-props': 'off', 'jsx-a11y-js/role-has-required-aria-props': 'error' },
    },
    {
      files: ['src/**/*'],
      excludeFiles: ['src/__tests__/**', 'src/**/*.test.{ts,tsx}'],
      rules: {
        '@eslint-community/eslint-comments/require-description': ['error', { ignore: ['eslint-enable'] }],
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-collapsible-if': 'error',
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/no-redundant-jump': 'error',
        'sonarjs/prefer-single-boolean-return': 'error',
        'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
        'typescript/switch-exhaustiveness-check': 'error',
        'typescript/await-thenable': 'error',
        'typescript/ban-ts-comment': 'error',
        'typescript/no-explicit-any': 'error',
        'typescript/no-floating-promises': 'error',
        'typescript/no-misused-promises': 'error',
        'typescript/no-unsafe-argument': 'error',
        'typescript/no-unsafe-assignment': 'error',
        'typescript/no-unsafe-call': 'error',
        'typescript/no-unsafe-member-access': 'error',
        'typescript/no-unsafe-return': 'error',
        'typescript/only-throw-error': 'error',
        'typescript/prefer-promise-reject-errors': 'error',
        'typescript/use-unknown-in-catch-callback-variable': 'error',
        'react/exhaustive-deps': 'error',
        'react/rules-of-hooks': 'error',
        'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
        'no-restricted-properties': [
          'error',
          { object: 'Reflect', property: 'get', message: 'Use typed property access or parse at the boundary.' },
          { object: 'Reflect', property: 'apply', message: 'Call the function directly.' },
        ],
        '@stylexjs/enforce-extension': 'error',
        '@stylexjs/no-legacy-contextual-styles': 'error',
        '@stylexjs/no-lookahead-selectors': 'error',
        '@stylexjs/no-nonstandard-styles': 'error',
        '@stylexjs/no-conflicting-props': 'error',
        '@stylexjs/no-unused': 'error',
        '@stylexjs/sort-keys': 'error',
        '@stylexjs/valid-shorthands': 'error',
        '@stylexjs/valid-styles': 'error',
        'eslint-compat/no-restricted-syntax': [
          'error',
          {
            selector: "Property > Literal.key[value='&:hover']",
            message: "Use hover() from mosaic/utils instead of bare '&:hover'.",
          },
          noLeakedConditionalJsx,
          {
            selector: "JSXOpeningElement[name.name='form']",
            message: 'Use `Form` from mosaic/primitives/form, which turns off the browser validation popup.',
          },
          {
            selector: "Property > Literal.key[value='@media (hover: hover)']",
            message: "Use hover() from mosaic/utils instead of raw '@media (hover: hover)'.",
          },
          {
            selector: "Property > Literal.key[value='@media (prefers-reduced-motion: no-preference)']",
            message:
              "Use motionSafe() from mosaic/utils instead of raw '@media (prefers-reduced-motion: no-preference)'.",
          },
          {
            selector:
              "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^[A-Z]/] > JSXAttribute[name.name=/^(className|style)$/]",
            message: 'Mosaic parts take `xstyle` (StyleX atoms) instead of `className`/`style`.',
          },
          {
            selector:
              "JSXOpeningElement[name.type='JSXMemberExpression'] > JSXAttribute[name.name=/^(className|style)$/]",
            message: 'Mosaic parts take `xstyle` (StyleX atoms) instead of `className`/`style`.',
          },
          {
            selector:
              "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^[A-Z]/] > JSXSpreadAttribute > CallExpression[callee.object.name='stylex'][callee.property.name='props']",
            message: 'Mosaic parts take the atoms as `xstyle`, not a `stylex.props(...)` spread.',
          },
          {
            selector:
              "JSXOpeningElement[name.type='JSXMemberExpression'] > JSXSpreadAttribute > CallExpression[callee.object.name='stylex'][callee.property.name='props']",
            message: 'Mosaic parts take the atoms as `xstyle`, not a `stylex.props(...)` spread.',
          },
        ],
      },
    },
    {
      files: ['src/**/*'],
      rules: {
        'jsx-a11y/heading-has-content': 'off',
        'jsx-a11y/label-has-associated-control': 'off',
      },
    },
    {
      files: ['src/**/*.styles.ts'],
      rules: {
        'eslint-compat/no-restricted-syntax': 'off',
      },
    },
    {
      files: ['src/primitives/**/*'],
      excludeFiles: ['src/**/*.test.{ts,tsx}'],
      rules: {
        'eslint-compat/no-restricted-syntax': ['error', noLeakedConditionalJsx],
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'typescript/no-import-type-side-effects': 'error',
      },
    },
    {
      files: ['src/**/*.{view,controller}.{ts,tsx}'],
      rules: {
        'mosaic/no-dynamic-message-catalogs': 'error',
      },
    },
    {
      files: ['src/**/*.model.{ts,tsx}'],
      rules: {
        'mosaic/no-model-react-state': 'error',
      },
    },
    {
      files: ['src/primitives/**/*.tsx', 'src/components/**/*.tsx'],
      excludeFiles: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
      rules: {
        'mosaic/forward-ref-parts': 'error',
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.{ts,tsx}'],
      rules: {
        'mosaic/no-raw-invoke': 'error',
      },
    },
    {
      files: ['src/features/**/*.{ts,tsx}'],
      excludeFiles: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.{ts,tsx}'],
      rules: noUnneededEffects.configs.strict.rules,
    },
    {
      files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      excludeFiles: ['src/**/*.test-d.{ts,tsx}'],
      rules: {
        'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*', 'assert*'] }],
        'vitest/no-focused-tests': 'error',
        'vitest/no-identical-title': 'error',
      },
    },
    {
      files: ['src/**/*'],
      excludeFiles: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.ts'],
      rules: {
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            checkAllOrigins: true,
            checkUnknownLocals: true,
            checkInternals: true,
            message:
              'Mosaic layers import down: features, then blocks, modals and queries, then components, hooks, utils and styles, then primitives. Move the shared piece down a layer, or pass it in as a prop.',
            policies: [
              { allow: { to: { module: { origin: ['external', 'core'] } } } },
              { allow: { to: { element: { type: '{{ from.element.type }}' } } } },
              { from: { element: { type: 'root' } }, allow: { to: { element: { type: '*' } } } },
              { from: { file: { categories: 'css-entry' } }, allow: { to: { element: { type: '*' } } } },
              {
                from: { element: { type: ['utils', 'hooks', 'styles', 'components', 'localization', 'modals'] } },
                allow: { to: { element: { type: SHARED } } },
              },
              {
                from: { element: { type: 'localization' } },
                allow: { to: { file: { categories: 'messages' } } },
              },
              {
                from: { element: { type: 'blocks' } },
                allow: [
                  { to: { element: { type: SHARED } } },
                  { to: { element: { type: 'features', captured: { feature: 'reverification' } } } },
                ],
              },
              {
                from: { element: { type: 'features' } },
                allow: { to: { element: { type: [...SHARED, 'queries', 'modals', 'blocks'] } } },
              },
              {
                from: FLOW_UI,
                disallow: {
                  dependency: { source: '@clerk/shared/react', kind: 'value', specifiers: CLERK_DATA_HOOKS },
                },
                message:
                  'Clerk data hooks can only be imported in models. Pass plain data and callbacks to controllers and views.',
              },
              {
                from: FLOW_UI,
                disallow: {
                  to: { file: { categories: 'messages' } },
                  dependency: { kind: 'value', nodeKind: ['import', 'export'] },
                },
                message: 'Use useMessages() for localized and overridden copy instead of importing catalog values.',
              },
              {
                from: FLOW_UI,
                disallow: { to: { element: { type: 'queries' } }, dependency: { kind: 'value' } },
                message: 'Read Clerk queries in the model and pass plain data to the controller or view.',
              },
              {
                from: FLOW_UI,
                disallow: {
                  to: { element: { type: 'hooks' } },
                  dependency: { kind: 'value', specifiers: 'useMosaicEnvironment' },
                },
                message: 'Read the Mosaic environment in the model and pass plain data to the controller or view.',
              },
              {
                from: FLOW_UI,
                disallow: {
                  to: { element: { type: 'hooks' } },
                  dependency: { kind: 'value', specifiers: 'useMosaicRouter' },
                },
                message: 'Read the Mosaic router in the model and pass plain callbacks to the controller or view.',
              },
              {
                from: FLOW_UI,
                disallow: {
                  to: { element: { type: 'hooks' } },
                  dependency: { kind: 'value', specifiers: 'useMosaicSupportEmail' },
                },
                message: 'Read the support email in the model and pass plain data to the controller or view.',
              },
              {
                from: { file: { categories: 'model' } },
                disallow: { dependency: { source: 'react', kind: 'value', specifiers: ['useState', 'useReducer'] } },
                message: 'Put interaction state in the controller and pass its results to the view.',
              },
              {
                from: { file: { categories: 'model' } },
                disallow: { to: { file: { categories: ['view', 'controller'] } }, dependency: { kind: 'value' } },
                message:
                  'A model answers with plain data and callbacks. Import only types from the controller or view.',
              },
              {
                from: { file: { categories: 'controller' } },
                disallow: { to: { file: { categories: 'view' } }, dependency: { kind: 'value' } },
                message: 'A controller hands props to the view. Import only types from the view.',
              },
            ],
          },
        ],
      },
    },
  ],
});
