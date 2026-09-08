import type { ClientJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../../core/clerk';
import { Client, SignIn } from '../../core/resources/internal';
import { createSession } from '../../test/core-fixtures';
import { createNativeAdapter, type EmbeddedHost, type EmbeddedState } from '../core';

const adapters: ReturnType<typeof createNativeAdapter>[] = [];
const key = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';

function fixture() {
  Client.clearInstance();
  const clerk = new Clerk(key);
  vi.spyOn(clerk, 'status', 'get').mockReturnValue('ready');
  const client = Client.getOrCreateInstance({
    object: 'client',
    id: 'client_owner',
    last_active_session_id: 'sess_owner',
    sessions: [createSession({ id: 'sess_owner', status: 'active' })],
  } as ClientJSON);
  clerk.client = client;
  clerk.session = client.signedInSessions[0];
  clerk.user = clerk.session.user;
  const states: EmbeddedState[] = [];
  let token = 'owner-token';
  const host: EmbeddedHost = {
    getToken: async () => token,
    saveToken: async value => {
      token = value;
    },
    getCachedResources: async () => ({ client: null, environment: null }),
    saveCachedResources: async () => undefined,
    publish: () => undefined,
    commitState: async state => {
      states.push(state);
    },
  };
  const adapter = createNativeAdapter(
    clerk,
    { protocolVersion: 1, generation: 'expo', publishableKey: key, sdkVersion: 'test' },
    host,
  );
  adapters.push(adapter);
  return {
    clerk,
    client,
    host,
    adapter,
    states,
    setToken: (value: string) => {
      token = value;
    },
  };
}

afterEach(async () => {
  await Promise.all(adapters.splice(0).map(adapter => adapter.dispose()));
  Client.clearInstance();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('native adapter for an existing Clerk owner', () => {
  it.each([
    { receiver: { kind: 'user' }, method: 'delete' },
    { receiver: { kind: 'signIn' }, method: 'prepareFirstFactor' },
    { receiver: { kind: 'signUp', id: '' }, method: 'update' },
    { receiver: { kind: 'userResource', id: 'idn_1', collection: 'sessions' }, method: 'destroy' },
    { receiver: { kind: 'listed', id: 'inv_1', listedKind: 'unknown' }, method: 'revoke' },
    {
      receiver: { kind: 'listed', id: 'inv_1', listedKind: 'organizationInvitation', scope: 'organizationDomain' },
      method: 'revoke',
    },
    { receiver: { kind: 'clerk', id: 'user_1' }, method: 'signOut' },
    { receiver: { kind: 'clerk' }, method: 'signOut', arguments: {} },
    { receiver: { kind: 'clerk' }, method: null },
    {
      receiver: { kind: 'clerk' },
      method: 'invokeForIdentity',
      arguments: [{ receiver: { kind: 'clerk' }, method: 'signOut' }, {}],
    },
  ])('rejects malformed native commands before executing them: %j', async invocation => {
    const f = fixture();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(f.adapter.invoke(invocation)).rejects.toMatchObject({ envelope: { code: 'invalid_invocation' } });
    expect(fetch).not.toHaveBeenCalled();
    expect(f.clerk.session?.id).toBe('sess_owner');
  });

  it.each(['signIn', 'signUp', 'user'] as const)(
    'rejects a retained %s snapshot before sending a request',
    async kind => {
      const f = fixture();
      const resource = kind === 'user' ? f.clerk.user! : f.client[kind];
      resource.id = `${kind}_current`;
      const fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ response: resource.__internal_toSnapshot() }),
      });
      vi.stubGlobal('fetch', fetch);
      await expect(
        f.adapter.invoke({ receiver: { kind, id: `${kind}_previous` }, method: 'reload' }),
      ).rejects.toMatchObject({ envelope: { code: kind === 'user' ? 'stale_resource' : 'stale_authentication' } });
      expect(fetch).not.toHaveBeenCalled();
      expect(resource.id).toBe(`${kind}_current`);
    },
  );

  it.each(['signIn', 'signUp', 'user'] as const)('allows operations on the current %s snapshot', async kind => {
    const f = fixture();
    const resource = kind === 'user' ? f.clerk.user! : f.client[kind];
    resource.id = `${kind}_current`;
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () => Promise.resolve({ response: resource.__internal_toSnapshot() }),
    });
    vi.stubGlobal('fetch', fetch);
    await expect(f.adapter.invoke({ receiver: { kind, id: resource.id }, method: 'reload' })).resolves.toMatchObject({
      id: resource.id,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('preserves a structured stale-resource error across identity wrapping and JSON transport', async () => {
    const f = fixture();
    try {
      await f.adapter.invoke({
        receiver: { kind: 'clerk' },
        method: 'invokeForIdentity',
        arguments: [
          { receiver: { kind: 'user', id: 'previous_user' }, method: 'delete' },
          { clientId: f.client.id, sessionId: f.clerk.session!.id },
        ],
      });
      expect.fail('A stale user must be rejected');
    } catch (error) {
      expect(JSON.parse(String(error))).toMatchObject({
        kind: 'resolution',
        code: 'stale_resource',
        message: 'The resource snapshot is no longer current',
      });
    }
    expect(f.clerk.user?.id).toBeTruthy();
  });

  it.each(['current', 'stale phone', 'stale watch'] as const)(
    'checks every forwarding hop before executing an operation (%s)',
    async state => {
      const f = fixture();
      const user = f.clerk.user!;
      const fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ response: user.__internal_toSnapshot() }),
      });
      vi.stubGlobal('fetch', fetch);
      const currentIdentity = { clientId: f.client.id, sessionId: f.clerk.session!.id };
      const invocation = {
        receiver: { kind: 'clerk' },
        method: 'invokeForIdentity',
        arguments: [
          {
            receiver: { kind: 'clerk' },
            method: 'invokeForIdentity',
            arguments: [
              { receiver: { kind: 'user', id: user.id }, method: 'reload' },
              state === 'stale watch' ? { ...currentIdentity, sessionId: 'old_watch_session' } : currentIdentity,
            ],
          },
          state === 'stale phone' ? { ...currentIdentity, sessionId: 'old_phone_session' } : currentIdentity,
        ],
      };
      if (state === 'current') {
        await expect(f.adapter.invoke(invocation)).resolves.toMatchObject({ id: user.id });
        expect(fetch).toHaveBeenCalledTimes(1);
      } else {
        await expect(f.adapter.invoke(invocation)).rejects.toMatchObject({ envelope: { code: 'stale_identity' } });
        expect(fetch).not.toHaveBeenCalled();
      }
      expect(f.clerk.session?.id).toBe('sess_owner');
    },
  );

  it('preserves the loaded owner and its cache provider without starting a second lifecycle', async () => {
    const f = fixture();
    const load = vi.spyOn(f.clerk, 'load');
    const cache = f.clerk.__internal_getCachedResources;
    const reload = vi.spyOn(f.client, 'reload');
    await f.adapter.load();
    expect(f.adapter.clerk).toBe(f.clerk);
    expect(load).not.toHaveBeenCalled();
    expect(f.clerk.__internal_getCachedResources).toBe(cache);
    await f.adapter.invoke({ receiver: { kind: 'clerk' }, method: 'setApplicationActive', arguments: [true] });
    expect(reload).not.toHaveBeenCalled();
    expect(f.states.at(-1)).toMatchObject({
      generation: 'expo',
      clientToken: 'owner-token',
      client: { id: 'client_owner', last_active_session_id: 'sess_owner' },
    });
  });

  it('publishes JS changes with the latest credential and awaits native commit before resolving', async () => {
    const f = fixture();
    await f.adapter.load();
    f.setToken('rotated-token');
    f.clerk.session = null;
    f.clerk.user = null;
    f.clerk.updateClient(f.client);
    await vi.waitFor(() =>
      expect(f.states.at(-1)).toMatchObject({ clientToken: 'rotated-token', client: { last_active_session_id: null } }),
    );
    let release!: () => void;
    f.host.commitState = () =>
      new Promise<void>(resolve => {
        release = resolve;
      });
    let completed = false;
    const invocation = f.adapter.invoke({ receiver: { kind: 'clerk' }, method: 'initialize' }).then(() => {
      completed = true;
    });
    await vi.waitFor(() => expect(release).toBeTypeOf('function'));
    expect(completed).toBe(false);
    release();
    await invocation;
    expect(completed).toBe(true);
  });

  it('rejects stale native operations before modifying the JS owner', async () => {
    const f = fixture();
    const signOut = vi.spyOn(f.clerk, 'signOut');
    await expect(
      f.adapter.invoke({
        receiver: { kind: 'clerk' },
        method: 'invokeForIdentity',
        arguments: [
          { receiver: { kind: 'clerk' }, method: 'signOut' },
          { clientId: 'client_owner', sessionId: 'old_session' },
        ],
      }),
    ).rejects.toThrow('different active identity');
    expect(signOut).not.toHaveBeenCalled();
    expect(f.clerk.session?.id).toBe('sess_owner');
  });

  it.each(['one operation', 'separate completion'] as const)(
    'preserves the completed attempt when the response clears client.sign_in (%s)',
    async mode => {
      const f = fixture();
      f.client.signIn = new SignIn({
        object: 'sign_in',
        id: 'sia_completed',
        status: 'needs_first_factor',
        first_factor_verification: { strategy: 'email_code', status: 'unverified' },
      } as any);
      await f.adapter.load();
      const response = {
        ...f.client.signIn.__internal_toSnapshot(),
        status: 'complete',
        created_session_id: 'sess_owner',
        first_factor_verification: { strategy: 'email_code', status: 'verified' },
      };
      const client = { ...f.client.__internal_toSnapshot(), sign_in: null };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ response, client }),
        }),
      );
      const result =
        mode === 'one operation'
          ? await f.adapter.invoke({
              receiver: { kind: 'clerk' },
              method: 'verifyNativeSignInCode',
              arguments: [{ expectedId: 'sia_completed', code: '424242' }],
            })
          : await (async () => {
              await f.adapter.invoke({
                receiver: { kind: 'signIn', id: 'sia_completed' },
                method: 'attemptFirstFactor',
                arguments: [{ strategy: 'email_code', code: '424242' }],
              });
              return f.adapter.invoke({ receiver: { kind: 'clerk' }, method: 'finishNativeSignIn' });
            })();
      expect(result).toMatchObject({ id: 'sia_completed', status: 'complete', created_session_id: 'sess_owner' });
      expect(f.clerk.client?.signIn.id).toBeFalsy();
      expect(f.states.at(-1)?.client?.sign_in?.id).toBeFalsy();
      expect(f.clerk.session?.id).toBe('sess_owner');

      f.clerk.session = null;
      f.clerk.user = null;
      f.client.sessions = [];
      f.clerk.updateClient(f.client);
      await expect(
        f.adapter.invoke({
          receiver: { kind: 'clerk' },
          method: 'completeNativeAuth',
          arguments: [{ flow: 'signIn', expectedId: 'sia_completed' }],
        }),
      ).rejects.toThrow('no longer current');
    },
  );

  it('leaves the owner usable after disposal and stops publishing its changes', async () => {
    const f = fixture();
    await f.adapter.load();
    await f.adapter.dispose();
    const count = f.states.length;
    const response = { object: 'client', id: 'client_owner', sessions: [], last_active_session_id: null };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, headers: new Headers(), json: async () => ({ response }) }),
    );
    await f.client.reload();
    f.clerk.updateClient(f.client);
    expect(f.clerk.client?.id).toBe('client_owner');
    expect(f.clerk.session).toBeNull();
    expect(f.states).toHaveLength(count);
  });
});
