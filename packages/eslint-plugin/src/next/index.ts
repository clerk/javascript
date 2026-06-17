import type { ESLint } from 'eslint';

import requireAuthProtection from './require-auth-protection';

const plugin: ESLint.Plugin = {
  meta: {
    name: '@clerk/eslint-plugin/next',
    version: PACKAGE_VERSION,
  },
  rules: {
    'require-auth-protection': requireAuthProtection,
  },
};

export default plugin;
