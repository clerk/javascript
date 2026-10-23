import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk } from '@clerk/shared/types';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { bindClerk, type ClerkSessionsHost } from '../clerk';

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
