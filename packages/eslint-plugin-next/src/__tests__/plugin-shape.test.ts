import { describe, expect, it } from 'vitest';

import plugin from '../index.js';

describe('@clerk/eslint-plugin-next public shape', () => {
  it('exposes a stable set of rules', () => {
    expect(Object.keys(plugin.rules ?? {}).sort()).toMatchSnapshot();
  });

  it('exposes a stable set of configs', () => {
    expect(Object.keys(plugin.configs ?? {}).sort()).toMatchSnapshot();
  });

  it('declares plugin meta', () => {
    expect(plugin.meta?.name).toBe('@clerk/eslint-plugin-next');
  });
});
