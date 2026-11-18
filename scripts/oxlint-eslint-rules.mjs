import { builtinRules } from 'eslint/use-at-your-own-risk';

export default {
  rules: Object.fromEntries(['no-restricted-syntax', 'no-undef-init'].map(name => [name, builtinRules.get(name)])),
};
