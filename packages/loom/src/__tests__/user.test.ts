import { describe, expect, it, vi } from 'vitest';

import { parseHydration } from '../hydration';
import { prefetchUser } from '../server';
import { parseUser, userSnapshot } from '../user';

const scope = { instanceKey: 'instance', userId: 'user_a', sessionId: 'sess_a' };
const user = {
  id: 'user_a',
  firstName: 'Ada',
  lastName: null,
  username: null,
  imageUrl: 'https://img.example/ada',
  hasImage: true,
  primaryEmailAddressId: 'email_a',
  primaryPhoneNumberId: null,
  phoneNumbers: null,
  primaryWeb3WalletId: null,
  web3Wallets: null,
  passkeys: null,
  totpEnabled: null,
  backupCodeEnabled: null,
  emailAddresses: [
    {
      id: 'email_a',
      emailAddress: 'ada@example.com',
      verification: { status: 'verified', strategy: null, expireAt: null, error: null },
    },
  ],
  passwordEnabled: false,
  deleteSelfEnabled: true,
  enterpriseAccounts: [],
  externalAccounts: [
    {
      id: 'external_a',
      provider: 'google',
      approvedScopes: '',
      username: null,
      emailAddress: 'ada@example.com',
      verification: { status: 'verified', strategy: null, expireAt: null, error: null },
    },
    {
      id: 'external_b',
      provider: 'github',
      approvedScopes: '',
      username: 'ada',
      emailAddress: '',
      verification: { status: 'pending', strategy: null, expireAt: null, error: null },
    },
  ],
};

describe('user snapshots', () => {
  it('projects backend and FAPI fields without private data', () => {
    expect(
      userSnapshot(
        {
          ...user,
          emailAddresses: [{ ...user.emailAddresses[0], secret: 'private' }],
          privateMetadata: { secret: true },
          externalAccounts: user.externalAccounts.map(account => ({
            ...account,
            approvedScopes: '',
            externalAccountId: 'secret',
            verification: { ...account.verification, externalVerificationRedirectURL: 'secret' },
          })),
          raw: 'secret',
        },
        scope.userId,
      ),
    ).toEqual(user);
    expect(
      parseUser(
        {
          response: {
            id: 'user_a',
            first_name: 'Ada',
            last_name: null,
            username: null,
            image_url: user.imageUrl,
            has_image: true,
            primary_email_address_id: 'email_a',
            email_addresses: [
              {
                id: 'email_a',
                email_address: 'ada@example.com',
                verification: { status: 'verified', secret: 'private' },
              },
            ],
            private_metadata: 'secret',
            password_enabled: false,
            delete_self_enabled: true,
            enterprise_accounts: [],
            external_accounts: user.externalAccounts.map(account => ({
              id: account.id,
              provider: account.provider,
              username: account.username,
              email_address: account.emailAddress,
              verification: account.verification,
              approved_scopes: '',
            })),
          },
        },
        scope.userId,
      ),
    ).toEqual(user);
  });
  it.each([
    { ...user, id: 'other' },
    { ...user, firstName: 1 },
    { id: 'user_a' },
    { ...user, imageUrl: null },
    { ...user, emailAddresses: [{ ...user.emailAddresses[0], verification: { status: 1 } }] },
    { ...user, emailAddresses: [user.emailAddresses[0], user.emailAddresses[0]] },
    { ...user, passwordEnabled: undefined },
    { ...user, deleteSelfEnabled: 1 },
    { ...user, externalAccounts: undefined },
    { ...user, externalAccounts: [{ ...user.externalAccounts[0], id: '' }] },
    { ...user, externalAccounts: [{ ...user.externalAccounts[0], verification: { status: 1 } }] },
    { ...user, externalAccounts: [user.externalAccounts[0], user.externalAccounts[0]] },
  ])('rejects invalid users', value => {
    expect(() => userSnapshot(value, scope.userId)).toThrow();
  });
  it('projects user-only hydration and rejects invalid or empty entries', () => {
    const seed = { version: 5, scope, user: { data: { ...user, raw: 'secret' }, updatedAt: 10 } };
    expect(parseHydration(seed)).toEqual({ version: 5, scope, user: { data: user, updatedAt: 10 } });
    expect(() => parseHydration({ ...seed, version: 3 })).toThrow();
    expect(() => parseHydration({ version: 2, scope })).toThrow();
    expect(() => parseHydration({ ...seed, user: { data: user, updatedAt: NaN } })).toThrow();
    expect(() => parseHydration(seed, { ...scope, sessionId: 'other' })).toThrow();
  });
});

describe('server user prefetch', () => {
  it('does not resolve backend when signed out', async () => {
    const resolveBackend = vi.fn();
    expect(await prefetchUser({ identity: { userId: null, sessionId: null }, resolveBackend })).toBeUndefined();
    expect(resolveBackend).not.toHaveBeenCalled();
  });
  it('captures identity and projects the backend user', async () => {
    const identity = { userId: 'user_a', sessionId: 'sess_a' };
    const getUser = vi.fn(() => Promise.resolve({ ...user, privateMetadata: 'secret', raw: 'secret' }));
    const state = await prefetchUser({
      identity,
      resolveBackend: () => {
        identity.userId = 'other';
        return Promise.resolve({
          client: { users: { getUser } },
          routing: { publishableKey: 'pk', frontendApi: 'host', domain: '' },
        });
      },
    });
    expect(getUser).toHaveBeenCalledWith('user_a');
    expect(state?.user?.data).toEqual(user);
    expect(JSON.stringify(state)).not.toContain('secret');
  });
  it('isolates concurrent identities and rejects a mismatched backend user', async () => {
    const pending = Promise.withResolvers<unknown>();
    const routing = { publishableKey: 'pk', frontendApi: 'host', domain: '' };
    const first = prefetchUser({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () => Promise.resolve({ routing, client: { users: { getUser: () => pending.promise } } }),
    });
    const second = await prefetchUser({
      identity: { userId: 'user_b', sessionId: 'sess_b' },
      resolveBackend: () =>
        Promise.resolve({
          routing,
          client: { users: { getUser: () => Promise.resolve({ ...user, id: 'user_b', firstName: 'Grace' }) } },
        }),
    });
    pending.resolve(user);
    expect((await first)?.user?.data.firstName).toBe('Ada');
    expect(second?.user?.data.firstName).toBe('Grace');
    await expect(
      prefetchUser({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () =>
          Promise.resolve({
            routing,
            client: { users: { getUser: () => Promise.resolve({ ...user, id: 'other' }) } },
          }),
      }),
    ).rejects.toThrow('authenticated');
  });
});
