import type { ESLint } from 'eslint';
import { noSideEffectsInInitialization } from './rules/no-side-effects-in-initialization.ts';

const plugin: ESLint.Plugin = {
  meta: {
    name: 'tree-shaking',
  },
  configs: {},
  rules: {
    'no-side-effects-in-initialization': noSideEffectsInInitialization,
  },
};

Object.assign((plugin.configs ??= {}), {
  recommended: {
    plugins: { 'tree-shaking': plugin },
    rules: { 'tree-shaking/no-side-effects-in-initialization': 'error' },
  },
});

export default plugin;
