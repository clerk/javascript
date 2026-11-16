import path from 'node:path';

import noUnneededEffects from 'eslint-plugin-react-you-might-not-need-an-effect';
import { defineConfig } from 'oxlint';

import rootConfig from '../../oxlint.config.mjs';

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

const jsxGuards = [
  noLeakedConditionalJsx,
  {
    selector: "JSXOpeningElement[name.name='form']",
    message:
      'Use `Form` from src/primitives/form, driven by `useForm` from src/components/form for values, validation and submit.',
  },
  {
    selector:
      "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^[A-Z]/] > JSXAttribute[name.name=/^(className|style)$/]",
    message:
      'Mosaic parts take `xstyle` instead of `className`/`style`. Define the atoms with `stylex.create` in the sibling `*.styles.ts` file and pass `xstyle={styles.root}`.',
  },
  {
    selector: "JSXOpeningElement[name.type='JSXMemberExpression'] > JSXAttribute[name.name=/^(className|style)$/]",
    message:
      'Mosaic parts take `xstyle` instead of `className`/`style`. Define the atoms with `stylex.create` in the sibling `*.styles.ts` file and pass `xstyle={styles.root}`.',
  },
  {
    selector:
      "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^[A-Z]/] > JSXSpreadAttribute > CallExpression[callee.object.name='stylex'][callee.property.name='props']",
    message:
      'Mosaic parts take the atoms as `xstyle`, not a `stylex.props(...)` spread. Define them with `stylex.create` in the sibling `*.styles.ts` file and pass `xstyle={styles.root}`.',
  },
  {
    selector:
      "JSXOpeningElement[name.type='JSXMemberExpression'] > JSXSpreadAttribute > CallExpression[callee.object.name='stylex'][callee.property.name='props']",
    message:
      'Mosaic parts take the atoms as `xstyle`, not a `stylex.props(...)` spread. Define them with `stylex.create` in the sibling `*.styles.ts` file and pass `xstyle={styles.root}`.',
  },
];
const renderProp = "JSXAttribute[name.name='render'] > JSXExpressionContainer";
const renderCallback = `${renderProp} > :matches(ArrowFunctionExpression, FunctionExpression)`;
const notInRenderProp = `:not(${renderProp} > JSXElement > JSXOpeningElement, ${renderCallback} > JSXElement > JSXOpeningElement, ${renderCallback} > BlockStatement > ReturnStatement > JSXElement > JSXOpeningElement)`;
const visibleInput = `JSXOpeningElement[name.name='input']${notInRenderProp}:not(:has(> JSXAttribute[name.name='hidden']:matches([value=null], [value.expression.value=true])))`;
const inputOfType = type => `${visibleInput}:has(> JSXAttribute[name.name='type'][value.value='${type}'])`;
const inputTypeGuards = [
  ['password', 'Use `PasswordInput` from src/components/password-input inside `Field` from src/components/field.'],
  ['tel', 'Use `PhoneInput` from src/components/phone-input inside `Field` from src/components/field.'],
  [
    'checkbox',
    'Use `Checkbox` from src/components/checkbox, or `Switch` from src/components/switch for an on/off setting.',
  ],
  ['radio', 'Use `Radio` from src/components/radio.'],
  [
    'file',
    'Use `FileUpload` from src/primitives/file-upload, or `AvatarUpload` from src/blocks/avatar-upload for an avatar or logo.',
  ],
];
const rawElementGuards = [
  {
    selector: `JSXOpeningElement[name.name='button']${notInRenderProp}`,
    message:
      'Use `Button` from src/components/button, or `SubmitButton` when the click runs an async action (it shows the pending state for you).',
  },
  {
    selector: `JSXOpeningElement[name.name='svg']${notInRenderProp}`,
    message:
      'Use an icon from src/icons through `Icon` from src/components/icon. If no icon fits, stop and ask the user; do not add a glyph or draw an `<svg>`.',
  },
  ...inputTypeGuards.map(([type, message]) => ({ selector: inputOfType(type), message })),
  {
    selector: `${visibleInput}:not(:has(> JSXAttribute[name.name='type'][value.value=/^(hidden|${inputTypeGuards.map(([type]) => type).join('|')})$/]))`,
    message: 'Use `Input` from src/components/input inside `Field` from src/components/field.',
  },
];

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
      { type: 'routing', pattern: 'src/routing', partialMatch: false },
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
        'eslint-compat/no-restricted-syntax': ['error', ...jsxGuards],
      },
    },
    {
      files: ['src/features/**/*', 'src/blocks/**/*'],
      excludeFiles: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
      rules: {
        'eslint-compat/no-restricted-syntax': ['error', ...jsxGuards, ...rawElementGuards],
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
        'eslint-compat/no-restricted-syntax': [
          'error',
          {
            selector: "Property[key.value=/:hover/]:not(Property[key.value='@media (hover: hover)'] Property)",
            message:
              "Put :hover inside '@media (hover: hover)' so it does not stick after a tap on touch devices (docs/stylex.md).",
          },
          {
            selector: 'Property[key.value=/:hover/]:not([key.value=/:not\\([^)]*disabled/])',
            message:
              'Skip disabled controls in a :hover key, e.g. \':hover:not(:disabled, [data-disabled], [aria-disabled="true"])\'. Browsers still match :hover on disabled elements (docs/stylex.md).',
          },
          {
            selector:
              "Property[key.name='transitionProperty']:not(:has(Property[key.value=/prefers-reduced-motion: reduce/])) Literal[value=/(^|,)\\s*(transform|translate|scale|rotate|all)\\s*(,|$)/]:not(Property[key.value=/prefers-reduced-motion: no-preference/] Literal)",
            message:
              "A transition that moves something must drop the moving property under '@media (prefers-reduced-motion: reduce)' (docs/motion.md).",
          },
          {
            selector:
              "Property[key.name='transitionProperty'] Property[key.value=/prefers-reduced-motion: reduce/] Literal[value=/(^|,)\\s*(transform|translate|scale|rotate|all)\\s*(,|$)/]",
            message:
              "A transition that moves something must drop the moving property under '@media (prefers-reduced-motion: reduce)' (docs/motion.md).",
          },
          {
            selector:
              'Property[key.name=/^(transform|translate|scale|rotate)$/]:not(:has(Property[key.value=/prefers-reduced-motion: reduce/])) Property[key.value=/data-(starting|ending)-style/]:not(Property[key.value=/prefers-reduced-motion: no-preference/] Property)',
            message:
              "An enter or exit offset must restate the enter and exit values inside '@media (prefers-reduced-motion: reduce)', or it snaps there instead (docs/motion.md).",
          },
        ],
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
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: [
        'src/hooks/use-now.ts',
        'src/mosaic-provider.tsx',
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.test-d.{ts,tsx}',
      ],
      rules: {
        'mosaic/no-render-clock': 'error',
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
              'Mosaic layers import down: features, then blocks, modals, queries and routing, then components, hooks, utils and styles, then primitives. Move the shared piece down a layer, or pass it in as a prop.',
            policies: [
              { allow: { to: { module: { origin: ['external', 'core'] } } } },
              { allow: { to: { element: { type: '{{ from.element.type }}' } } } },
              { from: { element: { type: 'root' } }, allow: { to: { element: { type: '*' } } } },
              { from: { file: { categories: 'css-entry' } }, allow: { to: { element: { type: '*' } } } },
              {
                from: { element: { type: ['utils', 'hooks', 'styles', 'components', 'localization', 'modals'] } },
                allow: { to: { element: { type: SHARED } } },
              },
              { from: { element: { type: 'modals' } }, allow: { to: { element: { type: 'routing' } } } },
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
                allow: { to: { element: { type: [...SHARED, 'queries', 'modals', 'blocks', 'routing'] } } },
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
                message:
                  "Read copy with `useMessages('<namespace>')` from src/localization, so the customer's locale and overrides apply. Do not import a `*.messages.ts` value.",
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
