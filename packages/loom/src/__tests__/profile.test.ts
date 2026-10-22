import { QueryObserver } from '@tanstack/query-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import { parseHydration } from '../hydration';
import { parseProfileSettings, profileSettingsSnapshot } from '../profile-settings';
import { prefetchProfile } from '../server';
import { backendUserSnapshot, parseUser, resourceUserSnapshot } from '../user';
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
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('profile prefetch', () => {
  it('preserves a safe enterprise reconnect message when the browser resource takes over', () => {
    const projected = resourceUserSnapshot(
      {
        id: 'user_a',
        firstName: null,
        lastName: null,
        username: null,
        imageUrl: '',
        hasImage: false,
        primaryEmailAddressId: null,
        emailAddresses: [],
        passwordEnabled: false,
        deleteSelfEnabled: true,
        externalAccounts: [],
        enterpriseAccounts: [
          {
            id: 'eac_a',
            active: true,
            provider: 'saml',
            emailAddress: 'ada@acme.example',
            enterpriseConnection: { name: 'Acme', disableAdditionalIdentifications: false },
            verification: { error: { longMessage: 'Reconnect required', secret: 'private' } },
          },
        ],
      },
      'user_a',
    );
    expect(projected.enterpriseAccounts[0]?.verificationError).toBe('Reconnect required');
    expect(JSON.stringify(projected)).not.toContain('private');
  });
  it('keeps safe profile identifications and enrollment flags while excluding secrets', () => {
    const projected = backendUserSnapshot(
      {
        raw: {
          ...raw,
          phone_numbers: [
            {
              id: 'phone_a',
              phone_number: '+15551230000',
              reserved_for_second_factor: true,
              default_second_factor: true,
              verification: { status: 'verified', secret: 'private' },
              backup_codes: ['private'],
            },
          ],
          primary_phone_number_id: 'phone_a',
          web3_wallets: [
            {
              id: 'wallet_a',
              web3_wallet: '0xabc',
              verification: { status: 'verified', strategy: 'web3_metamask', message: 'private' },
            },
          ],
          primary_web3_wallet_id: 'wallet_a',
          passkeys: [{ id: 'passkey_a', name: 'Laptop', created_at: 123, last_used_at: null, credential: 'private' }],
          totp_enabled: true,
          backup_code_enabled: true,
          totp_secret: 'private',
        },
      },
      'user_a',
    );
    expect(projected.phoneNumbers?.[0]?.phoneNumber).toBe('+15551230000');
    expect(projected.web3Wallets?.[0]?.web3Wallet).toBe('0xabc');
    expect(projected.passkeys?.[0]?.name).toBe('Laptop');
    expect(projected.totpEnabled).toBe(true);
    expect(projected.backupCodeEnabled).toBe(true);
    expect(JSON.stringify(projected)).not.toContain('private');
    expect(backendUserSnapshot({ raw }, 'user_a').passkeys).toBeNull();
  });
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
    expect(result.phoneNumber?.enabled).toBe(false);
    expect(result.web3Wallet?.enabled).toBe(false);
    expect(result.passkey?.enabled).toBe(false);
    expect(result.mfaRequired).toBe(false);
    expect(result.applicationName).toBe('My Application');
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
    ).rejects.toThrow('routing');
    expect(fetch).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  },
);

it('cancels the public environment request when the user read fails', async () => {
  let signal: AbortSignal | null | undefined;
  const pendingUser = Promise.withResolvers<unknown>();
  const aborted = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn((_url: URL, options: RequestInit) => {
      signal = options.signal;
      signal?.addEventListener('abort', aborted, { once: true });
      return new Promise<Response>(() => {});
    }),
  );
  const pending = prefetchProfile({
    identity: { userId: 'user_a', sessionId: 'sess_a' },
    resolveBackend: () =>
      Promise.resolve({
        routing,
        client: { users: { getUser: () => pendingUser.promise } },
      }),
  });
  const rejection = expect(pending).rejects.toThrow('Loom profile user read failed.');
  await vi.waitFor(() => expect(signal).toBeInstanceOf(AbortSignal));
  pendingUser.reject(new Error('secret credential'));
  await rejection;
  expect(signal?.aborted).toBe(true);
  expect(aborted).toHaveBeenCalledTimes(1);
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
  it('recovers an interrupted settings body and removes the abort listener', async () => {
    const response = Response.json(environment);
    vi.spyOn(response, 'json').mockRejectedValue(new TypeError('secret transport detail'));
    const fetch = vi.fn((_url: URL, options: RequestInit) => {
      if (!options.signal) {
        throw new Error('Missing abort signal');
      }
      vi.spyOn(options.signal, 'removeEventListener');
      return Promise.resolve(response);
    });
    vi.stubGlobal('fetch', fetch);
    const profile = await prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({ routing, client: { users: { getUser: () => Promise.resolve({ raw }) } } }),
    });
    expect(await profile?.settings).toEqual({ kind: 'unavailable' });
    const signal = fetch.mock.calls[0]?.[1].signal;
    expect(signal?.removeEventListener).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('sanitizes parser exceptions that contain an invalid provider URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json({
            ...environment,
            user_settings: {
              ...environment.user_settings,
              social: {
                ...environment.user_settings.social,
                oauth_github: { ...environment.user_settings.social.oauth_github, logo_url: 'secret invalid URL' },
              },
            },
          }),
        ),
      ),
    );
    const profile = await prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({ routing, client: { users: { getUser: () => Promise.resolve({ raw }) } } }),
    });
    await expect(profile?.settings).rejects.toEqual(new Error('Invalid Loom profile settings response.'));
  });

  it.each(['fetch', 'body'])('bounds a stalled settings %s without holding user data', async stage => {
    vi.useFakeTimers();
    let signal: AbortSignal | null | undefined;
    const response = Response.json(environment);
    const body = Promise.withResolvers<unknown>();
    if (stage === 'body') {
      vi.spyOn(response, 'json').mockReturnValue(body.promise);
    }
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: URL, options: RequestInit) => {
        signal = options.signal;
        return stage === 'fetch' ? new Promise<Response>(() => {}) : Promise.resolve(response);
      }),
    );
    const profile = await prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({ routing, client: { users: { getUser: () => Promise.resolve({ raw }) } } }),
    });
    expect(profile?.hydration.user.data.firstName).toBe('Ada');
    const settled = vi.fn();
    void profile?.settings.then(settled);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(settled).not.toHaveBeenCalled();
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await profile?.settings).toEqual({ kind: 'unavailable' });
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    body.resolve(environment);
    expect(await profile?.settings).toEqual({ kind: 'unavailable' });
  });

  it.each(['success', 'http failure', 'invalid data', 'user failure'])(
    'removes the optional deadline after %s',
    async outcome => {
      vi.useFakeTimers();
      const fetch = vi.fn(() =>
        outcome === 'user failure'
          ? new Promise<Response>(() => {})
          : Promise.resolve(
              outcome === 'http failure'
                ? new Response(null, { status: 503 })
                : Response.json(outcome === 'invalid data' ? {} : environment),
            ),
      );
      vi.stubGlobal('fetch', fetch);
      const pending = prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () =>
          Promise.resolve({
            routing,
            client: {
              users: {
                getUser: () =>
                  outcome === 'user failure' ? Promise.reject(new Error('secret')) : Promise.resolve({ raw }),
              },
            },
          }),
      });
      if (outcome === 'user failure') {
        await expect(pending).rejects.toThrow('user read failed');
      } else {
        const profile = await pending;
        if (outcome === 'invalid data') {
          await expect(profile?.settings).rejects.toThrow('Invalid Loom profile settings response.');
        } else {
          await profile?.settings;
        }
      }
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it.each(['invalid JSON', 'invalid data', 'unexpected fetch error'])(
    'observes %s safely while the required user is pending',
    async outcome => {
      const pendingUser = Promise.withResolvers<unknown>();
      const fetch = vi.fn(() =>
        outcome === 'unexpected fetch error'
          ? Promise.reject(new Error('secret credential'))
          : Promise.resolve(
              outcome === 'invalid JSON'
                ? new Response('secret invalid JSON')
                : Response.json({ secret: 'credential' }),
            ),
      );
      vi.stubGlobal('fetch', fetch);
      const pending = prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () => Promise.resolve({ routing, client: { users: { getUser: () => pendingUser.promise } } }),
      });
      await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      await new Promise(resolve => setTimeout(resolve, 0));
      pendingUser.resolve({ raw });
      const profile = await pending;
      await expect(profile?.settings).rejects.toThrow(
        outcome === 'unexpected fetch error'
          ? 'Loom profile settings request failed.'
          : 'Invalid Loom profile settings response.',
      );
    },
  );

  it('rejects a backend user from another authenticated identity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(environment))),
    );
    await expect(
      prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () =>
          Promise.resolve({
            routing,
            client: { users: { getUser: () => Promise.resolve({ raw: { ...raw, id: 'user_b' } }) } },
          }),
      }),
    ).rejects.toThrow('Invalid Loom profile user response.');
  });

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
      vi.fn(() => Promise.reject(new TypeError('secret credential'))),
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
    await expect(
      prefetchProfile({
        identity: { userId: 'user_a', sessionId: 'sess_a' },
        resolveBackend: () => Promise.reject(new Error('secret credential')),
      }),
    ).rejects.toThrow('Loom profile backend resolution failed.');
  });

  it.each(['user', 'session', 'instance'])('isolates concurrent requests differing by %s', async difference => {
    const fetch = vi.fn((_url: URL) => Promise.resolve(Response.json(environment)));
    vi.stubGlobal('fetch', fetch);
    const firstUser = Promise.withResolvers<unknown>();
    const secondUser = Promise.withResolvers<unknown>();
    const firstRead = vi.fn(() => firstUser.promise);
    const secondRead = vi.fn(() => secondUser.promise);
    const secondIdentity = {
      userId: difference === 'user' ? 'user_b' : 'user_a',
      sessionId: difference === 'session' ? 'sess_b' : 'sess_a',
    };
    const secondRouting =
      difference === 'instance'
        ? {
            ...routing,
            publishableKey: `pk_test_${btoa('other.clerk.accounts.dev$')}`,
            frontendApi: 'other.clerk.accounts.dev',
          }
        : routing;
    const pendingFirst = prefetchProfile({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () => Promise.resolve({ routing, client: { users: { getUser: firstRead } } }),
    });
    const pendingSecond = prefetchProfile({
      identity: secondIdentity,
      resolveBackend: () => Promise.resolve({ routing: secondRouting, client: { users: { getUser: secondRead } } }),
    });
    await vi.waitFor(() => expect(firstRead).toHaveBeenCalledExactlyOnceWith('user_a'));
    expect(secondRead).toHaveBeenCalledExactlyOnceWith(secondIdentity.userId);
    expect(fetch).toHaveBeenCalledTimes(2);
    secondUser.resolve({ raw: { ...raw, id: secondIdentity.userId, first_name: 'Second request' } });
    const second = await pendingSecond;
    firstUser.resolve({ raw });
    const first = await pendingFirst;
    expect(first?.hydration.scope).not.toEqual(second?.hydration.scope);
    expect(first?.hydration.user.data.firstName).toBe('Ada');
    expect(second?.hydration.user.data.firstName).toBe('Second request');
    expect(await first?.settings).toMatchObject({ hydration: { scope: first?.hydration.scope } });
    expect(await second?.settings).toMatchObject({ hydration: { scope: second?.hydration.scope } });
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      new URL('https://example.clerk.accounts.dev/v1/environment'),
      new URL(`https://${secondRouting.frontendApi}/v1/environment`),
    ]);
  });
});
