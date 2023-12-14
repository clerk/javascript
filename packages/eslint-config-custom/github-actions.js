const { YAML_FILES } = require('./_constants');

module.exports = {
  plugins: ['eslint-plugin-regex'],
  overrides: [
    {
      files: YAML_FILES,
      parser: 'any-eslint-parser',
      rules: {
        'regex/invalid': [
          'error',
          [
            {
              regex: '^(?!.*\\$TURBO_ARGS( |$)).*turbo \\S+',
              message: 'Invalid turbo CI command. Must contain `$TURBO_ARGS`',
            },
          ],
        ],
      },
    },
  ],
};
