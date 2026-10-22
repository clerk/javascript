import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk } from '@clerk/shared/types';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { bindClerk, type ClerkSessionsHost } from '../clerk';
import environment from './fixtures/environment.json';

const session = {
  id: 'sess_other',
  status: 'active',
  expire_at: 1000,
  abandon_at: 2000,
  last_active_at: 500,
  actor: null,
  latest_activity: { id: 'activity_a', browser_name: 'Safari', is_mobile: false },
};

function hostFixture() {
  const listeners = new Set<() => void>();
  const request = vi.fn<ReturnType<NonNullable<ClerkSessionsHost['getFapiClient']>>['request']>();
  request.mockResolvedValue(Object.assign(new Response(null, { status: 200 }), { payload: [session] }));
  const host = {
    loaded: true,
    publishableKey: 'pk_test_a',
    frontendApi: 'clerk.test',
    proxyUrl: undefined,
    domain: '',
    user: {
      id: 'user_a',
      firstName: 'Ada',
      lastName: null,
      username: null,
      imageUrl: 'https://img.example/ada',
      hasImage: false,
      primaryEmailAddressId: null,
      emailAddresses: [],
      passwordEnabled: false,
      deleteSelfEnabled: true,
      externalAccounts: [],
      enterpriseAccounts: [],
    },
    session: { id: 'sess_current' },
    getFapiClient: () => ({ request }),
    on: (_event: 'status', listener: () => void) => {
      listeners.add(listener);
    },
    off: (_event: 'status', listener: () => void) => {
      listeners.delete(listener);
    },
    addListener: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return {
    host,
    request,
    listeners,
    emit: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe('host ClerkJS bridge', () => {
  it('accepts the SDK facade as a structural host', () => {
    expectTypeOf<LoadedClerk>().toExtend<ClerkSessionsHost>();
  });

  it('rejects a loaded host without transport support', async () => {
    const { host } = hostFixture();
    const { getFapiClient: _transport, ...legacyHost } = host;
    const binding = bindClerk(legacyHost);
    await expect(binding.getSnapshot()?.fetch()).rejects.toThrow('Clerk transport is unavailable');
    binding.dispose();
  });

  it('uses the host transport with captured identity and parses fresh snapshots', async () => {
    const { host, request } = hostFixture();
    const binding = bindClerk(host);
    const loom = binding.getSnapshot();
    expect(await loom?.fetch()).toEqual([
      {
        id: 'sess_other',
        status: 'active',
        expireAt: 1000,
        abandonAt: 2000,
        lastActiveAt: 500,
        hasActor: false,
        latestActivity: { id: 'activity_a', browserName: 'Safari', isMobile: false },
      },
    ]);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/me/sessions/active', sessionId: 'sess_current' }),
    );
    await loom?.refresh();
    expect(request).toHaveBeenCalledTimes(2);
    await loom?.revoke('sess_other');
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'POST', path: '/me/sessions/sess_other/revoke', body: '' }),
    );
    binding.dispose();
  });

  it('preserves HTTP status, Clerk error codes, retry delay, and trace', async () => {
    const { host, request } = hostFixture();
    request.mockResolvedValue(
      Object.assign(
        new Response(null, { status: 403, headers: { 'retry-after': '12', 'x-clerk-trace-id': 'trace_a' } }),
        {
          payload: {
            errors: [
              { code: 'session_reverification_required', message: 'Verify again', long_message: 'Verify your session' },
            ],
          },
        },
      ),
    );
    const binding = bindClerk(host);
    try {
      await binding.getSnapshot()?.fetch();
      expect.fail('Expected an HTTP error');
    } catch (error) {
      expect(isClerkAPIResponseError(error)).toBe(true);
      expect(error).toMatchObject({
        status: 403,
        retryAfter: 12,
        clerkTraceId: 'trace_a',
        errors: [{ code: 'session_reverification_required', longMessage: 'Verify your session' }],
      });
    }
    binding.dispose();
  });

  it('rejects malformed success payloads instead of returning an empty list', async () => {
    const { host, request } = hostFixture();
    request.mockResolvedValue(Object.assign(new Response(), { payload: { response: [] } }));
    const binding = bindClerk(host);
    await expect(binding.getSnapshot()?.fetch()).rejects.toThrow('sessions');
    binding.dispose();
  });

  it('gates readiness, retires old callbacks, and removes its host listener', async () => {
    const { host, request, emit, listeners } = hostFixture();
    host.loaded = false;
    const binding = bindClerk(host);
    expect(binding.getSnapshot()).toBeNull();
    host.loaded = true;
    emit();
    const old = binding.getSnapshot();
    await old?.fetch();
    host.session = { id: 'sess_new' };
    await expect(old?.revoke('sess_other')).rejects.toThrow('identity');
    expect(request).toHaveBeenCalledTimes(1);
    emit();
    expect(binding.getSnapshot()).not.toBe(old);
    await expect(old?.fetch()).rejects.toThrow('disposed');
    binding.dispose();
    expect(listeners.size).toBe(0);
    expect(binding.getSnapshot()).toBeNull();
  });

  it('rejects responses if identity changes before the host notification', async () => {
    const { host, request } = hostFixture();
    const pending = Promise.withResolvers<Response & { payload: unknown }>();
    request.mockReturnValueOnce(pending.promise);
    const binding = bindClerk(host);
    const result = binding.getSnapshot()?.fetch();
    host.user = { ...host.user, id: 'user_b' };
    pending.resolve(Object.assign(new Response(), { payload: [session] }));
    await expect(result).rejects.toThrow('identity');
    binding.dispose();
  });
});

describe('host user query', () => {
  const response = (firstName = 'Ada', id = 'user_a') =>
    Object.assign(new Response(), {
      payload: {
        response: {
          id,
          first_name: firstName,
          last_name: null,
          username: null,
          image_url: 'https://img.example/ada',
          has_image: false,
          primary_email_address_id: null,
          email_addresses: [],
          password_enabled: false,
          delete_self_enabled: true,
          external_accounts: [],
          enterprise_accounts: [],
        },
      },
    });
  it('invalidates the user query when displayed picture or email data changes in place', async () => {
    const { host, request, emit } = hostFixture();
    const hostUser: ClerkSessionsHost['user'] = host.user;
    if (!hostUser) {
      throw new Error('Missing host user');
    }
    hostUser.emailAddresses = [{ id: 'email_a', emailAddress: 'ada@example.com', verification: { status: null } }];
    request.mockImplementation(() =>
      Promise.resolve(
        Object.assign(new Response(), {
          payload: {
            response: {
              id: hostUser.id,
              first_name: hostUser.firstName,
              last_name: hostUser.lastName,
              username: hostUser.username,
              image_url: hostUser.imageUrl,
              has_image: hostUser.hasImage,
              primary_email_address_id: hostUser.primaryEmailAddressId,
              password_enabled: hostUser.passwordEnabled,
              delete_self_enabled: hostUser.deleteSelfEnabled,
              enterprise_accounts: [],
              external_accounts: hostUser.externalAccounts?.map(account => ({
                id: account.id,
                provider: account.provider,
                username: account.username,
                email_address: account.emailAddress,
                verification: account.verification,
              })),
              email_addresses: hostUser.emailAddresses?.map(email => ({
                id: email.id,
                email_address: email.emailAddress,
                verification: email.verification,
              })),
            },
          },
        }),
      ),
    );
    const binding = bindClerk(host);
    const client = binding.getSnapshot();
    if (!client) {
      throw new Error('Missing owner');
    }
    await client.fetchUser();
    const { QueryObserver } = await import('@tanstack/query-core');
    const observer = new QueryObserver(client.queryClient, client.userQueryOptions());
    const stop = observer.subscribe(() => {});
    hostUser.imageUrl = 'https://img.example/new';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.imageUrl).toBe('https://img.example/new'));
    const email = hostUser.emailAddresses?.[0];
    if (!email) {
      throw new Error('Missing email');
    }
    email.verification = { status: 'verified' };
    emit();
    await vi.waitFor(() =>
      expect(client.dehydrate()?.user?.data.emailAddresses[0]?.verification?.status).toBe('verified'),
    );
    hostUser.primaryEmailAddressId = 'email_a';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.primaryEmailAddressId).toBe('email_a'));
    hostUser.passwordEnabled = true;
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.passwordEnabled).toBe(true));
    hostUser.deleteSelfEnabled = false;
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.deleteSelfEnabled).toBe(false));
    const account: {
      id: string;
      provider: string;
      username: string | null;
      emailAddress: string;
      verification: { status: string | null };
    } = {
      id: 'external_a',
      provider: 'google',
      username: null,
      emailAddress: 'ada@example.com',
      verification: { status: null },
    };
    hostUser.externalAccounts = [account];
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.externalAccounts[0]?.id).toBe('external_a'));
    account.provider = 'github';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.externalAccounts[0]?.provider).toBe('github'));
    account.username = 'ada';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.externalAccounts[0]?.username).toBe('ada'));
    account.emailAddress = 'new@example.com';
    emit();
    await vi.waitFor(() =>
      expect(client.dehydrate()?.user?.data.externalAccounts[0]?.emailAddress).toBe('new@example.com'),
    );
    account.verification = { status: 'verified' };
    emit();
    await vi.waitFor(() =>
      expect(client.dehydrate()?.user?.data.externalAccounts[0]?.verification?.status).toBe('verified'),
    );
    account.id = 'external_b';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.externalAccounts[0]?.id).toBe('external_b'));
    emit();
    expect(request).toHaveBeenCalledTimes(12);
    stop();
    binding.dispose();
  });
  it('uses captured /me scope and refreshes only when the host profile tuple changes', async () => {
    const { host, request, emit } = hostFixture();
    request.mockResolvedValue(response());
    const binding = bindClerk(host);
    const client = binding.getSnapshot();
    if (!client) {
      throw new Error('Missing owner');
    }
    await client.fetchUser();
    const { QueryObserver } = await import('@tanstack/query-core');
    const observer = new QueryObserver(client.queryClient, client.userQueryOptions());
    const stop = observer.subscribe(() => {});
    emit();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/me', sessionId: 'sess_current', signal: expect.any(AbortSignal) }),
    );
    request.mockResolvedValue(response('Grace'));
    host.user.firstName = 'Grace';
    emit();
    await vi.waitFor(() => expect(client.dehydrate()?.user?.data.firstName).toBe('Grace'));
    emit();
    expect(request).toHaveBeenCalledTimes(2);
    stop();
    binding.dispose();
  });
  it.each(['user', 'session', 'instance', 'sign-out', 'dispose'])(
    'rejects delayed user responses after %s changes',
    async kind => {
      const { host, request, emit } = hostFixture();
      const boundHost: ClerkSessionsHost = host;
      const pending = Promise.withResolvers<Response & { payload: unknown }>();
      request.mockReturnValue(pending.promise);
      const binding = bindClerk(boundHost);
      const old = binding.getSnapshot();
      const result = old?.fetchUser();
      const rejected = expect(result).rejects.toBeDefined();
      await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
      if (kind === 'dispose') {
        binding.dispose();
      } else {
        if (kind === 'user') {
          host.user.id = 'user_b';
        } else if (kind === 'instance') {
          host.publishableKey = 'pk_test_b';
          host.frontendApi = 'other.clerk.test';
        } else if (kind === 'sign-out') {
          boundHost.user = null;
          boundHost.session = null;
        } else {
          host.session.id = 'sess_new';
        }
        emit();
      }
      pending.resolve(response());
      await rejected;
      expect(old?.queryClient.getQueryData(old.userQueryOptions().queryKey)).toBeUndefined();
      expect(binding.getSnapshot()?.dehydrate()?.user).toBeUndefined();
      binding.dispose();
    },
  );
  it('rejects a mismatched user and supersedes an older profile read', async () => {
    const { host, request, emit } = hostFixture();
    request.mockResolvedValueOnce(response('Wrong', 'other'));
    const binding = bindClerk(host);
    const client = binding.getSnapshot();
    await expect(client?.fetchUser()).rejects.toThrow('authenticated');
    const pending = Promise.withResolvers<Response & { payload: unknown }>();
    request.mockReturnValueOnce(pending.promise).mockResolvedValue(response('Grace'));
    const result = client?.fetchUser();
    const rejected = expect(result).rejects.toBeDefined();
    host.user.firstName = 'Grace';
    emit();
    pending.resolve(response());
    await rejected;
    expect((await client?.fetchUser())?.firstName).toBe('Grace');
    binding.dispose();
  });
});

describe('host settings query retirement', () => {
  it.each(['user', 'session', 'instance', 'sign-out', 'dispose'])(
    'discards a transport response already in flight when %s changes',
    async kind => {
      const { host, request, emit } = hostFixture();
      const boundHost: ClerkSessionsHost = host;
      const pending = Promise.withResolvers<Response & { payload: unknown }>();
      request.mockReturnValue(pending.promise);
      const binding = bindClerk(boundHost);
      const old = binding.getSnapshot();
      const result = old?.fetchProfileSettings();
      const rejected = expect(result).rejects.toBeDefined();
      await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: '/environment' }));
      if (kind === 'dispose') {
        binding.dispose();
      } else {
        if (kind === 'user') {
          host.user.id = 'user_b';
        } else if (kind === 'session') {
          host.session.id = 'sess_b';
        } else if (kind === 'instance') {
          host.publishableKey = 'pk_test_b';
          host.frontendApi = 'other.clerk.test';
        } else {
          boundHost.user = null;
          boundHost.session = null;
        }
        emit();
      }
      expect(request.mock.calls[0]?.[0].signal.aborted).toBe(true);
      pending.resolve(Object.assign(new Response(), { payload: environment }));
      await rejected;
      expect(old?.queryClient.getQueryData(old.profileSettingsQueryOptions().queryKey)).toBeUndefined();
      expect(binding.getSnapshot()?.dehydrate()?.profileSettings).toBeUndefined();
      binding.dispose();
    },
  );
});

describe('host name updates', () => {
  it('accepts the returned resource after a synchronous listener without fetching over it', async () => {
    const { host, emit, request } = hostFixture();
    const boundUser = {
      ...host.user,
      update: vi.fn((input: { firstName: string; lastName: string }) => {
        boundUser.firstName = 'Intermediate';
        emit();
        return Promise.resolve({ ...boundUser, ...input });
      }),
    };
    const binding = bindClerk({ ...host, user: boundUser });
    const loom = binding.getSnapshot();
    expect(await loom?.updateName({ firstName: 'Augusta', lastName: 'Lovelace' })).toMatchObject({
      firstName: 'Augusta',
      lastName: 'Lovelace',
    });
    expect(request).not.toHaveBeenCalled();
    expect(loom?.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toMatchObject({ firstName: 'Augusta' });
    binding.dispose();
  });

  it('refuses a managed name at call time and rejects a result after sign-out', async () => {
    const { host, emit } = hostFixture();
    const pending = Promise.withResolvers<typeof host.user>();
    const update = vi.fn(() => pending.promise);
    const boundHost: ClerkSessionsHost = { ...host, user: { ...host.user, update } };
    const binding = bindClerk(boundHost);
    const loom = binding.getSnapshot();
    if (!loom || !boundHost.user) {
      expect.fail('Expected live user');
    }
    boundHost.user.enterpriseAccounts = [{ active: true }];
    await expect(loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' })).rejects.toThrow('managed');
    expect(update).not.toHaveBeenCalled();
    boundHost.user.enterpriseAccounts = [];
    const result = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    const rejected = expect(result).rejects.toThrow();
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    boundHost.user = null;
    emit();
    pending.resolve({ ...host.user, firstName: 'Augusta' });
    await rejected;
    expect(binding.getSnapshot()).toBeNull();
    binding.dispose();
  });
});
