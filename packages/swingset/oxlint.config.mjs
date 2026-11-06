import { defineConfig } from 'oxlint';

import rootConfig from '../../oxlint.config.mjs';

export default defineConfig({
  ...rootConfig,
  overrides: [
    ...rootConfig.overrides,
    {
      files: ['src/**/*'],
      rules: {
        'turbo/no-undeclared-env-vars': ['error', { allowList: ['SWINGSET_DASHBOARD_URL'] }],
      },
    },
  ],
});
