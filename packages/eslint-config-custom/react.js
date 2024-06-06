const disabledRules = {
  'jsx-a11y/no-onchange': 'off',
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',

  // TODO: All rules below should be set to their defaults
  // when we're able to make the appropriate changes.
  'jsx-a11y/alt-text': 'warn',
  'jsx-a11y/html-has-lang': 'warn',
  'jsx-a11y/no-autofocus': 'warn',
  'react/button-has-type': 'warn',
  'react/display-name': 'off',
  'react/jsx-curly-brace-presence': 'off',
  'react/jsx-no-leaked-render': 'off',
  'react/jsx-no-useless-fragment': 'warn',
  'react/jsx-sort-props': 'off',
  'react-hooks/rules-of-hooks': 'warn',
};

const extensions = [
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'plugin:jsx-a11y/recommended',
  'plugin:import/react',
];

module.exports = {
  extends: extensions,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@emotion/*'],
            message:
              'Please do not import emotion directly. Import helpers from ./design-system or ./primitives instead.',
          },
        ],
      },
    ],
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
    ...disabledRules,
  },
  // TODO: Enable when we're able to make the appropriate changes.
  // overrides: [
  //   {
  //     files: TEST_FILES,
  //     extends: [...extensions, 'plugin:jest/recommended', 'plugin:testing-library/react'],
  //     plugins: ['testing-library'],
  //   },
  // ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
