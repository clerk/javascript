import { noDynamicMessageCatalogs, noModelReactState } from './rules.mjs';

export default [
  {
    name: 'packages/mosaic - import guard plugin',
    files: ['src/**/*'],
    plugins: {
      mosaic: {
        rules: {
          'no-model-react-state': noModelReactState,
          'no-dynamic-message-catalogs': noDynamicMessageCatalogs,
        },
      },
    },
  },
  {
    name: 'packages/mosaic - views and controllers',
    files: ['src/**/*.{view,controller}.{ts,tsx}'],
    rules: {
      'mosaic/no-dynamic-message-catalogs': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@clerk/shared/react',
              importNames: [
                'useClerk',
                'useUser',
                'useSession',
                'useSessionList',
                'useOrganization',
                'useOrganizationList',
                'useAuth',
              ],
              message:
                'Clerk data hooks can only be imported in models. Pass plain data and callbacks to controllers and views.',
              allowTypeImports: true,
            },
          ],
          patterns: [
            {
              regex: '[.]messages(?:[.]ts)?$',
              message: 'Use useMessages() for localized and overridden copy instead of importing catalog values.',
              allowTypeImports: true,
            },
            {
              regex: '(^|/)use-mosaic-environment(?:[.]ts)?$',
              importNames: ['useMosaicEnvironment'],
              message: 'Read the Mosaic environment in the model and pass plain data to the controller or view.',
              allowTypeImports: true,
            },
            {
              regex: '(^|/)use-mosaic-router(?:[.]ts)?$',
              importNames: ['useMosaicRouter'],
              message: 'Read the Mosaic router in the model and pass plain callbacks to the controller or view.',
              allowTypeImports: true,
            },
            {
              regex: '(^|/)use-mosaic-support-email(?:[.]ts)?$',
              importNames: ['useMosaicSupportEmail'],
              message: 'Read the support email in the model and pass plain data to the controller or view.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    name: 'packages/mosaic - feature tests',
    files: ['src/**/*.feature.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='findByRole'][arguments.0.value='alert']",
          message:
            "Live regions are always mounted, so findByRole('alert') can resolve before the text arrives. Use `await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(text))`.",
        },
      ],
    },
  },
  {
    name: 'packages/mosaic - models',
    files: ['src/**/*.model.{ts,tsx}'],
    rules: {
      'mosaic/no-model-react-state': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useState', 'useReducer'],
              message: 'Put interaction state in the controller and pass its results to the view.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
];
