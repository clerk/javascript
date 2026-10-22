import { QueryObserver } from '@tanstack/query-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import { parseHydration } from '../hydration';
import { parseProfileSettings, profileSettingsSnapshot } from '../profile-settings';
import { prefetchProfile } from '../server';
import { backendUserSnapshot, parseUser } from '../user';
import environment from './fixtures/environment.json';

const routing = {
  publishableKey: `pk_test_${btoa('example.clerk.accounts.dev$')}`,
  frontendApi: 'example.clerk.accounts.dev',
  domain: '',
  proxyUrl: 'https://untrusted.example',
};
const raw = {
  id: 'user_a',
  first_name: 'Ada',
  last_name: null,
  username: null,
  image_url: 'https://img.example/ada',
  has_image: true,
  primary_email_address_id: null,
  email_addresses: [],
  password_enabled: false,
  delete_self_enabled: true,
  external_accounts: [],
  enterprise_accounts: [],
  private_metadata: { secret: 'private' },
};
afterEach(() => vi.unstubAllGlobals());

describe('profile prefetch', () => {
  it('loads one user and public environment using trusted canonical routing', async () => {
    const fetch = vi.fn(() => Promise.resolve(Response.json(environment)));
    vi.stubGlobal('fetch', fetch);
    const getUser = vi.fn(() => Promise.resolve({ raw }));
    const resolveBackend = vi.fn(() => Promise.resolve({ routing, client: { users: { getUser } } }));
    const result = await prefetchProfile({ identity: { userId: 'user_a', sessionId: 'sess_a' }, resolveBackend });
    expect(resolveBackend).toHaveBeenCalledTimes(1);
    expect(getUser).toHaveBeenCalledExactlyOnceWith('user_a');
    expect(fetch).toHaveBeenCalledExactlyOnceWith(new URL('https://example.clerk.accounts.dev/v1/environment'), {
      method: 'GET',
      cache: 'no-store',
      redirect: 'error',
      signal: expect.any(AbortSignal),
    });
    expect(result?.hydration.version).toBe(5);
    expect(result?.hydration.user?.data.firstName).toBe('Ada');
    const settings = await result?.settings;
    expect(settings).toMatchObject({ kind: 'ready' });
    if (settings?.kind === 'ready') {
      expect(
        settings.hydration.profileSettings?.data.providers
          .filter(provider => provider.enabled)
          .map(provider => provider.strategy),
      ).toEqual(['oauth_github', 'oauth_google', 'oauth_x']);
    }
    expect(JSON.stringify(result)).not.toContain('private');
    expect(JSON.stringify(result)).not.toContain('password_settings');
  });
  it('does no work for signed-out identity and sanitizes failed settings', async () => {
    const fetch = vi.fn(() => Promise.resolve(new Response('', { status: 503 })));
    vi.stubGlobal('fetch', fetch);
    const resolveBackend = vi.fn(() =>
      Promise.resolve({ routing, client: { users: { getUser: () => Promise.resolve({ raw }) } } }),
    );
    expect(await prefetchProfile({ identity: { userId: null, sessionId: null }, resolveBackend })).toBeUndefined();
    expect(resolveBackend).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    const result = await prefetchProfile({ identity: { userId: 'user_a', sessionId: 'sess_a' }, resolveBackend });
    expect(await result?.settings).toEqual({ kind: 'unavailable' });
  });
});

describe('profile settings boundary', () => {
  it('accepts direct and wrapped responses and reconstructs allowlisted hydration', () => {
    const result = parseProfileSettings(environment);
    expect(parseProfileSettings({ response: environment })).toEqual(result);
    expect(profileSettingsSnapshot({ ...result, secret: 'private' })).toEqual(result);
    expect(result.firstName).toEqual({ enabled: true, required: false });
    expect(result.emailAddress.usedForFirstFactor).toBe(true);
  });
  it('rejects malformed settings and duplicate or unsafe providers', () => {
    expect(() => parseProfileSettings({})).toThrow();
    const result = parseProfileSettings(environment);
    expect(() => profileSettingsSnapshot({ ...result, username: { enabled: true } })).toThrow();
    expect(() =>
      profileSettingsSnapshot({ ...result, providers: [...result.providers, result.providers[0]] }),
    ).toThrow();
    expect(() =>
      profileSettingsSnapshot({
        ...result,
        providers: [{ strategy: 'oauth_test', enabled: true, name: 'Test', logoUrl: 'javascript:alert(1)' }],
      }),
    ).toThrow();
  });
});

it('preserves raw recovery errors and canonical external account IDs without leaking raw fields', () => {
  const result = backendUserSnapshot(
    {
      raw: {
        ...raw,
        external_accounts: [
          {
            id: 'google_provider_id',
            external_account_id: 'eac_a',
            provider: 'google',
            username: null,
            email_address: 'ada@example.com',
            approved_scopes: 'profile email',
            verification: {
              status: 'verified',
              strategy: 'oauth_google',
              expire_at: 123,
              error: { code: 'external_account_missing_refresh_token', long_message: 'Reconnect', secret: 'private' },
            },
            token: 'private',
          },
        ],
      },
    },
    'user_a',
  );
  expect(result.externalAccounts[0]).toEqual({
    id: 'eac_a',
    provider: 'google',
    username: null,
    emailAddress: 'ada@example.com',
    approvedScopes: 'profile email',
    verification: {
      status: 'verified',
      strategy: 'oauth_google',
      expireAt: 123,
      error: { code: 'external_account_missing_refresh_token', longMessage: 'Reconnect' },
    },
  });
  expect(JSON.stringify(result)).not.toContain('private');
});

it.each(['other.example.com', 'localhost', '127.0.0.1', 'user:password@example.com', 'example.com/path'])(
  'rejects invalid or inconsistent routing %s before reading',
  async frontendApi => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const getUser = vi.fn();
    await expect(
      prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () => Promise.resolve({ routing: { ...routing, frontendApi }, client: { users: { getUser } } }),
      }),
    ).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  },
);

it('cancels the public environment request when the user read fails', async () => {
  let signal: AbortSignal | null | undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn((_url: URL, options: RequestInit) => {
      signal = options.signal;
      return new Promise<Response>(() => {});
    }),
  );
  await expect(
    prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({
          routing,
          client: { users: { getUser: () => Promise.reject(new Error('User unavailable')) } },
        }),
    }),
  ).resolves.toBeUndefined();
  expect(signal?.aborted).toBe(true);
});

it.each(['google', 'facebook', 'github'])('preserves %s errors without optional long_message', provider => {
  const account = {
    id: 'provider_id',
    external_account_id: 'eac_a',
    provider,
    username: null,
    email_address: '',
    approved_scopes: '',
    verification: {
      status: 'failed',
      strategy: `oauth_${provider}`,
      error: { code: 'oauth_fetch_user_error', message: 'Reconnect' },
    },
  };
  const payload = { ...raw, external_accounts: [account] };
  expect(backendUserSnapshot({ raw: payload }, 'user_a')).toEqual(parseUser({ response: payload }, 'user_a'));
  expect(parseUser({ response: payload }, 'user_a').externalAccounts[0]?.verification?.error).toEqual({
    code: 'oauth_fetch_user_error',
    longMessage: 'Reconnect',
  });
  expect(() =>
    backendUserSnapshot(
      { raw: { ...payload, external_accounts: [account, { ...account, id: 'another_provider_id' }] } },
      'user_a',
    ),
  ).toThrow('Duplicate');
  expect(() =>
    backendUserSnapshot(
      { raw: { ...payload, external_accounts: [{ ...account, id: 'eac_contradictory' }] } },
      'user_a',
    ),
  ).toThrow('canonical');
});

it('refreshes only the user while preserving settings and failure data', async () => {
  const scope = { instanceKey: 'instance', userId: 'user_a', sessionId: 'sess_a' };
  const user = backendUserSnapshot({ raw }, 'user_a');
  const settings = parseProfileSettings(environment);
  const pending = Promise.withResolvers<typeof user>();
  const readUser = vi.fn(() => pending.promise);
  const readProfileSettings = vi.fn(() => Promise.resolve(settings));
  const owner = createLoomClient({
    scope,
    readUser,
    readProfileSettings,
    hydration: {
      version: 5,
      scope,
      user: { data: user, updatedAt: Date.now() },
      profileSettings: { data: settings, updatedAt: Date.now() },
    },
  });
  const observer = new QueryObserver(owner.queryClient, owner.userQueryOptions());
  const stop = observer.subscribe(() => {});
  const first = owner.invalidateUser();
  await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(1));
  pending.reject(new Error('Refresh failed'));
  await first;
  expect(await owner.fetchProfileSettings()).toEqual(settings);
  expect(readProfileSettings).not.toHaveBeenCalled();
  expect(owner.queryClient.getQueryData(owner.userQueryOptions().queryKey)).toEqual(user);
  stop();
  owner.dispose();
});

it('validates profile hydration scope and timestamps and drops injected settings fields', () => {
  const scope = { instanceKey: 'instance', userId: 'user_a', sessionId: 'sess_a' };
  const seed = {
    version: 5,
    scope,
    profileSettings: { data: { ...parseProfileSettings(environment), secret: 'private' }, updatedAt: 10 },
  };
  expect(JSON.stringify(parseHydration(seed))).not.toContain('private');
  expect(() => parseHydration(seed, { ...scope, sessionId: 'other' })).toThrow();
  expect(() => parseHydration({ ...seed, profileSettings: { ...seed.profileSettings, updatedAt: NaN } })).toThrow();
});

it('cancels an active refresh on a second mutation instead of accepting its stale completion', async () => {
  const scope = { instanceKey: 'instance', userId: 'user_a', sessionId: 'sess_a' };
  const user = backendUserSnapshot({ raw }, 'user_a');
  const stale = Promise.withResolvers<typeof user>();
  const fresh = Promise.withResolvers<typeof user>();
  const readUser = vi.fn().mockReturnValueOnce(stale.promise).mockReturnValueOnce(fresh.promise);
  const owner = createLoomClient({
    scope,
    readUser,
    hydration: { version: 5, scope, user: { data: user, updatedAt: Date.now() } },
  });
  const observer = new QueryObserver(owner.queryClient, owner.userQueryOptions());
  const stop = observer.subscribe(() => {});
  const first = owner.invalidateUser();
  await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(1));
  const second = owner.invalidateUser();
  await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(2));
  stale.resolve({ ...user, firstName: 'Old mutation' });
  fresh.resolve({ ...user, firstName: 'Latest mutation' });
  await Promise.all([first, second]);
  expect(owner.dehydrate()?.user?.data.firstName).toBe('Latest mutation');
  stop();
  owner.dispose();
});

describe('user-ready profile prefetch', () => {
  it('starts both reads once and returns real user data before settings', async () => {
    const pendingUser = Promise.withResolvers<unknown>();
    const pendingSettings = Promise.withResolvers<Response>();
    const getUser = vi.fn(() => pendingUser.promise);
    const fetch = vi.fn(() => pendingSettings.promise);
    vi.stubGlobal('fetch', fetch);
    const pending = prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () => Promise.resolve({ routing, client: { users: { getUser } } }),
    });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(getUser).toHaveBeenCalledExactlyOnceWith('user_a');
    pendingUser.resolve({ raw });
    const profile = await pending;
    expect(profile?.hydration.user?.data.firstName).toBe('Ada');
    expect(profile?.hydration.sessions).toBeUndefined();
    const ready = vi.fn();
    void profile?.settings.then(ready);
    expect(ready).not.toHaveBeenCalled();
    pendingSettings.resolve(Response.json(environment));
    expect(await profile?.settings).toMatchObject({
      kind: 'ready',
      hydration: { profileSettings: expect.any(Object) },
    });
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('handles settings failure while user is pending without serializing the failure', async () => {
    const pendingUser = Promise.withResolvers<unknown>();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('secret credential'))),
    );
    const pending = prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () => Promise.resolve({ routing, client: { users: { getUser: () => pendingUser.promise } } }),
    });
    await new Promise(resolve => setTimeout(resolve, 0));
    pendingUser.resolve({ raw });
    const profile = await pending;
    expect(profile?.hydration.user?.data.firstName).toBe('Ada');
    expect(await profile?.settings).toEqual({ kind: 'unavailable' });
    expect(JSON.stringify(profile)).not.toContain('secret');
  });

  it('sanitizes backend setup failure', async () => {
    expect(
      await prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () => Promise.reject(new Error('secret credential')),
      }),
    ).toBeUndefined();
  });

  it('keeps simultaneous authenticated scopes isolated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(environment))),
    );
    const getUser = vi.fn((id: string) => Promise.resolve({ raw: { ...raw, id } }));
    const resolveBackend = () => Promise.resolve({ routing, client: { users: { getUser } } });
    const [first, second] = await Promise.all([
      prefetchProfile({ identity: { userId: 'user_a', sessionId: 'sess_a' }, resolveBackend }),
      prefetchProfile({ identity: { userId: 'user_b', sessionId: 'sess_b' }, resolveBackend }),
    ]);
    expect(first?.hydration.user?.data.id).toBe('user_a');
    expect(second?.hydration.user?.data.id).toBe('user_b');
    expect(await first?.settings).toMatchObject({ hydration: { scope: { userId: 'user_a' } } });
    expect(await second?.settings).toMatchObject({ hydration: { scope: { userId: 'user_b' } } });
  });
});
