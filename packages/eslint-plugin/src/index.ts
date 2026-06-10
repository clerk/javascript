import type { ESLint } from 'eslint';

import requireAuthProtection from './rules/next/require-auth-protection';

export const next: ESLint.Plugin = {
  meta: {
    name: '@clerk/eslint-plugin/next',
    version: PACKAGE_VERSION,
  },
  rules: {
    'require-auth-protection': requireAuthProtection,
  },
};
