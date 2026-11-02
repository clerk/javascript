import path from 'node:path';

import vitest from '@vitest/eslint-plugin';
import boundaries from 'eslint-plugin-boundaries';
import noUnneededEffects from 'eslint-plugin-react-you-might-not-need-an-effect';

import { forwardRefParts, noDynamicMessageCatalogs, noModelReactState } from './rules.mjs';

const mosaicRoot = path.resolve(import.meta.dirname, '..');

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

export default [
  {
    name: 'packages/mosaic - import guard plugin',
    files: ['src/**/*'],
    plugins: {
      mosaic: {
        rules: {
          'no-model-react-state': noModelReactState,
          'no-dynamic-message-catalogs': noDynamicMessageCatalogs,
          'forward-ref-parts': forwardRefParts,
        },
      },
    },
  },
  {
    name: 'packages/mosaic - type-only imports',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    name: 'packages/mosaic - views and controllers',
    files: ['src/**/*.{view,controller}.{ts,tsx}'],
    rules: {
      'mosaic/no-dynamic-message-catalogs': 'error',
    },
  },
  {
    name: 'packages/mosaic - models',
    files: ['src/**/*.model.{ts,tsx}'],
    rules: {
      'mosaic/no-model-react-state': 'error',
    },
  },
  {
    name: 'packages/mosaic - parts',
    files: ['src/primitives/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'mosaic/forward-ref-parts': 'error',
    },
  },
  {
    name: 'packages/mosaic - effects',
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.{ts,tsx}'],
    plugins: noUnneededEffects.configs.strict.plugins,
    rules: noUnneededEffects.configs.strict.rules,
  },
  {
    name: 'packages/mosaic - tests',
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    ignores: ['src/**/*.test-d.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*', 'assert*'] }],
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
    },
  },
  {
    name: 'packages/mosaic - boundaries',
    files: ['src/**/*'],
    ignores: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.test-d.ts'],
    plugins: { boundaries },
    settings: {
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
    },
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
              message: 'A model answers with plain data and callbacks. Import only types from the controller or view.',
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
];
