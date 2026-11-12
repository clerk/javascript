import { logger } from '@clerk/shared/logger';
import { describe, expect, it, vi } from 'vitest';

import { getAvailableUserProfilePages, resolveUserProfilePages, userProfileNavEntries } from '../user-profile.layout';
import type { CustomProfilePage, UserProfilePages } from '../user-profile.types';

const terms: CustomProfilePage = { label: 'Terms', path: 'terms', content: null };
const help: CustomProfilePage = { label: 'Help', path: 'help', content: null };

describe('getAvailableUserProfilePages', () => {
  it('keeps the built-in order and drops pages without content', () => {
    expect(getAvailableUserProfilePages({ account: {}, apiKeys: {} } as UserProfilePages)).toEqual([
      'account',
      'apiKeys',
    ]);
    expect(getAvailableUserProfilePages({ account: {}, security: {}, billing: {} } as UserProfilePages)).toEqual([
      'account',
      'security',
      'billing',
    ]);
  });

  it.each([null, false])('drops api keys given %s content', apiKeys => {
    expect(getAvailableUserProfilePages({ account: {}, apiKeys } as UserProfilePages)).toEqual(['account']);
  });
});

describe('resolveUserProfilePages', () => {
  it('keeps the first custom page for a repeated path', () => {
    const otherTerms: CustomProfilePage = { label: 'Other terms', path: 'terms', content: null };
    const otherAccount: CustomProfilePage = { label: 'Other account', path: 'account', content: null };
    const account: CustomProfilePage = { label: 'My account', path: 'account', content: null };

    expect(resolveUserProfilePages(['account'], [account, terms, otherTerms, otherAccount])).toEqual([
      { id: 'account', custom: account },
      { id: 'terms', custom: terms },
    ]);
  });

  it('leaves out a custom page whose path cannot be a route, and warns', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const encoded: CustomProfilePage = { label: 'My page', path: 'my%20page', content: null };
    const param: CustomProfilePage = { label: 'Param', path: ':id', content: null };
    const spaced: CustomProfilePage = { label: 'Spaced', path: 'my page', content: null };

    expect(resolveUserProfilePages(['account'], [encoded, terms, param, spaced])).toEqual([
      { id: 'account' },
      { id: 'terms', custom: terms },
      { id: 'my page', custom: spaced },
    ]);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('"my%20page"');
    warn.mockRestore();
  });

  it("leaves out a custom page whose path is a built-in page's segment, and warns", () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const apiKeys: CustomProfilePage = { label: 'Keys', path: 'api-keys', content: null };

    expect(resolveUserProfilePages(['account', 'apiKeys'], [apiKeys, terms])).toEqual([
      { id: 'account' },
      { id: 'apiKeys' },
      { id: 'terms', custom: terms },
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"apiKeys"');
    warn.mockRestore();
  });

  it('leaves out a custom page whose path is not written as its segment, and warns', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const trailing: CustomProfilePage = { label: 'Security', path: 'security/', content: null };
    const leading: CustomProfilePage = { label: 'Terms', path: '/terms', content: null };
    const empty: CustomProfilePage = { label: 'Empty', path: '', content: null };

    expect(resolveUserProfilePages(['account', 'security'], [trailing, leading, empty, help])).toEqual([
      { id: 'account' },
      { id: 'security' },
      { id: 'help', custom: help },
    ]);
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn.mock.calls[0][0]).toContain('slash');
    expect(warn.mock.calls[0][0]).toContain('Use "security"');
    warn.mockRestore();
  });

  it('keeps a custom page whose path is an Object.prototype property', () => {
    const toString: CustomProfilePage = { label: 'To string', path: 'toString', content: null };
    expect(resolveUserProfilePages(['account'], [toString])).toEqual([
      { id: 'account' },
      { id: 'toString', custom: toString },
    ]);
  });

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

  it('lets a custom page replace a built-in it shares an id with, in its place', () => {
    const shadow: CustomProfilePage = { label: 'Mine', path: 'security', content: null };
    expect(resolveUserProfilePages(['account', 'security', 'billing'], [shadow])).toEqual([
      { id: 'account' },
      { id: 'security', custom: shadow },
      { id: 'billing' },
    ]);
  });
});

describe('userProfileNavEntries', () => {
  it('leaves out a custom page under the organization prefix, and says where it goes', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const members: CustomProfilePage = { label: 'Members', path: 'organization/members', content: null };

    expect(
      userProfileNavEntries({ pages: { account: {} } as UserProfilePages, customPages: [members, terms] }),
    ).toEqual([{ id: 'account' }, { id: 'terms', custom: terms }]);
    expect(warn).toHaveBeenCalledWith(
      '[Clerk] UserProfile custom page "organization/members" uses the reserved "organization/" prefix, so the page is left out. Use "members" in organizationProfileProps.customPages to add it to the organization\'s pages.',
    );
    warn.mockRestore();
  });
});
