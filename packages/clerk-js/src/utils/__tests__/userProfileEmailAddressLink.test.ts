import { describe, expect, it } from 'vitest';

import { getUserProfileEmailAddressLinkStatus } from '../userProfileEmailAddressLink';

describe('getUserProfileEmailAddressLinkStatus', () => {
  const statusAt = (url: string, routing: { routing?: 'path' | 'hash' | 'virtual'; path?: string }) =>
    getUserProfileEmailAddressLinkStatus(routing, new URL(url, 'https://example.com'));

  it.each([
    ['/user/verify?__clerk_status=verified', { routing: 'path', path: '/user' }, 'verified'],
    ['/user/verify?__clerk_status=expired', { path: '/user' }, 'expired'],
    ['/user/verify/?__clerk_status=failed', { routing: 'path', path: '/user' }, 'failed'],
    ['/user/verify?__clerk_status=client_mismatch', { routing: 'path', path: '/user/' }, 'client_mismatch'],
    ['/settings/account/verify?__clerk_status=expired', { routing: 'path', path: '/settings/account' }, 'expired'],
    ['/verify?__clerk_status=verified', { routing: 'path', path: '/' }, 'verified'],
    ['/user?__clerk_status=expired#/verify', { routing: 'path', path: '/user' }, 'expired'],
    ['/account?__clerk_status=expired#/verify', {}, 'expired'],
    ['/account?__clerk_status=verified#/verify/', { routing: 'hash' }, 'verified'],
    ['/account?a=b&__clerk_status=failed#/verify?redirect_url=%2F', { routing: 'hash' }, 'failed'],
  ] as const)('returns the status at %s with %o', (url, routing, status) => {
    expect(statusAt(url, routing)).toBe(status);
  });

  it.each([
    ['/user/verify', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=transferable', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=unknown', { routing: 'path', path: '/user' }],
    ['/user/security?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user/verify/extra?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user?__clerk_status=verified#/security', { routing: 'path', path: '/user' }],
    ['/other/verify?__clerk_status=verified', { routing: 'path', path: '/user' }],
    ['/user/verify?__clerk_status=verified', { routing: 'path', path: '/settings/user' }],
    ['/account?__clerk_status=verified', {}],
    ['/account?__clerk_status=verified#/security', {}],
    ['/account?__clerk_status=verified#/verify/extra', { routing: 'hash' }],
    ['/account/verify?__clerk_status=verified', { routing: 'hash' }],
  ] as const)('returns null at %s with %o', (url, routing) => {
    expect(statusAt(url, routing)).toBeNull();
  });
});
