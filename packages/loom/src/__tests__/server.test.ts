import { buildPublishableKey } from '@clerk/shared/keys';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import { useSessions } from '../react';
import { LoomClientProvider } from '../react-context';
import { prefetchSessions } from '../server';
import type { Sessions } from '../types';

it('renders concurrent request-local owners in Node without a browser or ClerkJS', async () => {
  expect(typeof window).toBe('undefined');
  const scope = { instanceKey: 'controlled', userId: 'user_a', sessionId: 'sess_a' };
  const device = (id: string): Sessions => [
    {
      id,
      status: 'active',
      lastActiveAt: null,
      expireAt: 1000,
      abandonAt: 1000,
      hasActor: false,
      latestActivity: { id: 'a' },
    },
  ];
  const a = createLoomClient({
    scope,
    transport: { read: () => Promise.resolve(device('request_a')), revoke: () => Promise.resolve() },
  });
  const b = createLoomClient({
    scope,
    transport: { read: () => Promise.resolve(device('request_b')), revoke: () => Promise.resolve() },
  });
  await Promise.all([a.prefetch(), b.prefetch()]);
  function List() {
    return createElement('p', null, useSessions().data?.[0]?.id);
  }
  const html = (client: typeof a) => renderToString(createElement(LoomClientProvider, { client }, createElement(List)));
  expect(html(a)).toBe('<p>request_a</p>');
  expect(html(b)).toBe('<p>request_b</p>');
  expect(JSON.stringify(a.dehydrate())).not.toContain('request_b');
  a.dispose();
  expect(html(b)).toBe('<p>request_b</p>');
  b.dispose();
});

const publishableKey = buildPublishableKey('clerk.example.com');
const routing = { publishableKey, frontendApi: 'clerk.example.com', proxyUrl: '/proxy', domain: 'example.com' };

function response(userId: string, sessionId: string) {
  return {
    object: 'active_device_sessions',
    subject: { instance_id: 'ins_a', user_id: userId, session_id: sessionId },
    sessions: [
      {
        id: sessionId,
        status: 'active',
        last_active_at: 1,
        expire_at: 2,
        abandon_at: 3,
        has_actor: true,
        latest_activity: { id: 'activity' },
        secret: 'must-not-hydrate',
      },
    ],
  };
}

it.each([
  { userId: null, sessionId: null },
  { userId: 'user_a', sessionId: null },
  { userId: null, sessionId: 'sess_a' },
  { userId: '', sessionId: 'sess_a' },
  { userId: 'user_a', sessionId: '' },
])('does not resolve a backend for incomplete identity %#', async identity => {
  const resolveBackend = vi.fn();
  await expect(prefetchSessions({ identity, resolveBackend })).resolves.toBeUndefined();
  expect(resolveBackend).not.toHaveBeenCalled();
});

it('resolves request routing once, forwards the selected ID and signal, and projects the snapshot', async () => {
  const sessions = {
    marker: 'request-client',
    getActiveDevices: vi.fn(function (this: { marker: string }, sessionId: string, options: { signal: AbortSignal }) {
      expect(this.marker).toBe('request-client');
      expect(sessionId).toBe('sess_a');
      expect(options.signal).toBeInstanceOf(AbortSignal);
      return Promise.resolve(response('user_a', 'sess_a'));
    }),
  };
  const getActiveDevices = sessions.getActiveDevices;
  const resolveBackend = vi.fn().mockResolvedValue({ client: { sessions }, routing });
  const hydration = await prefetchSessions({ identity: { userId: 'user_a', sessionId: 'sess_a' }, resolveBackend });
  expect(resolveBackend).toHaveBeenCalledOnce();
  expect(getActiveDevices).toHaveBeenCalledWith('sess_a', { signal: expect.any(AbortSignal) });
  expect(hydration?.scope).toEqual({
    instanceKey: JSON.stringify([publishableKey, 'clerk.example.com', '/proxy', 'example.com']),
    userId: 'user_a',
    sessionId: 'sess_a',
  });
  expect(hydration?.sessions?.data[0]?.hasActor).toBe(true);
  expect(JSON.stringify(hydration)).not.toContain('must-not-hydrate');
});

it('captures identity before awaiting backend resolution', async () => {
  const identity = { userId: 'user_a', sessionId: 'sess_a' };
  const hydration = await prefetchSessions({
    identity,
    resolveBackend: () => {
      identity.userId = 'user_b';
      identity.sessionId = 'sess_b';
      return Promise.resolve({
        client: { sessions: { getActiveDevices: () => Promise.resolve(response('user_a', 'sess_a')) } },
        routing,
      });
    },
  });
  expect(hydration?.scope.userId).toBe('user_a');
  expect(hydration?.scope.sessionId).toBe('sess_a');
});

it.each([
  { name: 'wrong object', payload: { ...response('user_a', 'sess_a'), object: 'sessions' } },
  { name: 'missing subject', payload: { ...response('user_a', 'sess_a'), subject: null } },
  { name: 'non-array sessions', payload: { ...response('user_a', 'sess_a'), sessions: null } },
  { name: 'wrong user', payload: response('user_b', 'sess_a') },
  { name: 'wrong session', payload: response('user_a', 'sess_b') },
  {
    name: 'empty instance',
    payload: { ...response('user_a', 'sess_a'), subject: { instance_id: '', user_id: 'user_a', session_id: 'sess_a' } },
  },
  {
    name: 'invalid actor',
    payload: {
      ...response('user_a', 'sess_a'),
      sessions: [{ ...response('user_a', 'sess_a').sessions[0], has_actor: 'yes' }],
    },
  },
  {
    name: 'invalid timestamp',
    payload: {
      ...response('user_a', 'sess_a'),
      sessions: [{ ...response('user_a', 'sess_a').sessions[0], expire_at: 'tomorrow' }],
    },
  },
  { name: 'missing selected session', payload: { ...response('user_a', 'sess_a'), sessions: [] } },
  {
    name: 'inactive selected session',
    payload: {
      ...response('user_a', 'sess_a'),
      sessions: [{ ...response('user_a', 'sess_a').sessions[0], status: 'ended' }],
    },
  },
])('rejects $name', async ({ payload }) => {
  await expect(
    prefetchSessions({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({ client: { sessions: { getActiveDevices: () => Promise.resolve(payload) } }, routing }),
    }),
  ).rejects.toThrow();
});

it('propagates resolver and backend errors', async () => {
  const failure = new Error('endpoint unavailable');
  await expect(
    prefetchSessions({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () => Promise.reject(failure),
    }),
  ).rejects.toBe(failure);
  await expect(
    prefetchSessions({
      identity: { userId: 'user_a', sessionId: 'sess_a' },
      resolveBackend: () =>
        Promise.resolve({
          client: {
            sessions: {
              getActiveDevices: () => Promise.reject(failure),
            },
          },
          routing,
        }),
    }),
  ).rejects.toBe(failure);
});

it('isolates concurrent backend reads and their dynamic routing', async () => {
  const aRead = Promise.withResolvers<void>();
  const bRead = Promise.withResolvers<void>();
  const create = (userId: string, proxyUrl: string, read: Promise<void>) =>
    prefetchSessions({
      identity: { userId, sessionId: `sess_${userId}` },
      resolveBackend: () =>
        Promise.resolve({
          client: { sessions: { getActiveDevices: () => read.then(() => response(userId, `sess_${userId}`)) } },
          routing: { ...routing, proxyUrl },
        }),
    });
  const aPromise = create('a', '/a', aRead.promise);
  const bPromise = create('b', '/b', bRead.promise);
  bRead.resolve();
  const b = await bPromise;
  aRead.resolve();
  const a = await aPromise;
  expect(a?.scope.instanceKey).toBe(JSON.stringify([publishableKey, 'clerk.example.com', '/a', 'example.com']));
  expect(b?.scope.instanceKey).toBe(JSON.stringify([publishableKey, 'clerk.example.com', '/b', 'example.com']));
  expect(a?.sessions?.data[0]?.id).toBe('sess_a');
  expect(b?.sessions?.data[0]?.id).toBe('sess_b');
  expect(JSON.stringify(a)).not.toContain('sess_b');
});
