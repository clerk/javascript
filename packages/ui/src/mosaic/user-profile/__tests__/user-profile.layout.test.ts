import { describe, expect, it } from 'vitest';

import { getAvailableUserProfilePages, resolveUserProfilePages } from '../user-profile.layout';
import type { CustomProfilePage } from '../user-profile.types';

const terms: CustomProfilePage = { label: 'Terms', path: 'terms', content: null };
const help: CustomProfilePage = { label: 'Help', path: 'help', content: null };

describe('getAvailableUserProfilePages', () => {
  it('keeps the built-in order and drops pages without content', () => {
    expect(getAvailableUserProfilePages({ account: {}, apiKeys: { apiKeys: [] } })).toEqual(['account', 'apiKeys']);
    expect(getAvailableUserProfilePages({ account: {}, security: {}, billing: {} })).toEqual([
      'account',
      'security',
      'billing',
    ]);
  });
});

describe('resolveUserProfilePages', () => {
  it('lists the built-ins, then the custom pages by path', () => {
    expect(resolveUserProfilePages(['account', 'security'], [terms, help])).toEqual([
      { id: 'account' },
      { id: 'security' },
      { id: 'terms', custom: terms },
      { id: 'help', custom: help },
    ]);
  });

  it('moves the named ids to the front, in the order named, and drops names matching nothing', () => {
    expect(
      resolveUserProfilePages(['account', 'security'], [terms], ['terms', 'billing', 'account']).map(e => e.id),
    ).toEqual(['terms', 'account', 'security']);
  });

  it('lets a custom page shadow a built-in it shares an id with', () => {
    const shadow: CustomProfilePage = { label: 'Mine', path: 'security', content: null };
    expect(resolveUserProfilePages(['account', 'security'], [shadow])).toEqual([{ id: 'account' }, { id: 'security' }]);
  });
});
