import { buildPublishableKey } from '@clerk/shared/keys';
import { expect, it, vi } from 'vitest';

import { createHandoffStore, type HandoffHost } from '../handoff-state';
import { createClerkScope } from '../scope';

function host() {
  const listeners = new Set<() => void>();
  const statuses = new Set<() => void>();
  const clerk: HandoffHost = {
    loaded: false,
    status: 'loading',
    publishableKey: 'pk_test_a',
    frontendApi: 'clerk.test',
    proxyUrl: undefined,
    domain: '',
    user: null,
    session: null,
    addListener: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    on: (_event, listener) => {
      statuses.add(listener);
    },
    off: (_event, listener) => {
      statuses.delete(listener);
    },
  };
  return { clerk, emit: () => [...listeners, ...statuses].forEach(listener => listener()), listeners, statuses };
}

const scope = (clerk: HandoffHost) => createClerkScope(clerk, { userId: 'user_a', sessionId: 'sess_a' });

it('keeps the seed while an unloaded wrapper has no frontend API and hands off when it loads', () => {
  const current = host();
  current.clerk.publishableKey = buildPublishableKey(current.clerk.frontendApi);
  const serverScope = scope(current.clerk);
  current.clerk.frontendApi = '';
  const store = createHandoffStore(current.clerk, serverScope);
  expect(store.getServerSnapshot().kind).toBe('seed');
  expect(store.getSnapshot().kind).toBe('seed');
  const unsubscribe = store.subscribe(vi.fn());
  current.clerk.frontendApi = 'clerk.test';
  current.clerk.loaded = true;
  current.clerk.status = 'ready';
  current.clerk.user = { id: 'user_a' };
  current.clerk.session = { id: 'sess_a' };
  current.emit();
  expect(store.getSnapshot()).toMatchObject({ kind: 'live', clerk: current.clerk, scope: serverScope });
  unsubscribe();
});

it.each([
  { frontendApi: 'other.clerk.test' },
  { frontendApi: '', publishableKey: buildPublishableKey('other.clerk.test') },
  { frontendApi: '', domain: 'other.test' },
  { frontendApi: '', proxyUrl: 'https://other.test/clerk' },
  { frontendApi: '', publishableKey: 'pk_test_invalid' },
])('rejects a known instance mismatch from an unloaded wrapper: %o', mismatch => {
  const current = host();
  current.clerk.publishableKey = buildPublishableKey(current.clerk.frontendApi);
  const serverScope = scope(current.clerk);
  Object.assign(current.clerk, mismatch);
  const store = createHandoffStore(current.clerk, serverScope);
  expect(store.getServerSnapshot().kind).toBe('waiting');
  expect(store.getSnapshot().kind).toBe('waiting');
});

it('keeps a matching seed until Clerk resolves and never revives it after sign-out', () => {
  const current = host();
  const store = createHandoffStore(current.clerk, scope(current.clerk));
  const notify = vi.fn();
  const unsubscribe = store.subscribe(notify);
  expect(store.getSnapshot().kind).toBe('seed');
  current.clerk.loaded = true;
  current.clerk.status = 'ready';
  current.clerk.user = { id: 'user_a' };
  current.clerk.session = { id: 'sess_a' };
  current.emit();
  expect(store.getSnapshot()).toMatchObject({ kind: 'live', clerk: current.clerk });
  current.clerk.user = null;
  current.clerk.session = null;
  current.emit();
  expect(store.getSnapshot().kind).toBe('waiting');
  current.clerk.user = { id: 'user_a' };
  current.clerk.session = { id: 'sess_a' };
  current.emit();
  expect(store.getSnapshot().kind).toBe('live');
  expect(notify).toHaveBeenCalled();
  unsubscribe();
  expect(current.listeners.size + current.statuses.size).toBe(0);
});

it('retires a seed on host replacement or known instance mismatch', () => {
  const first = host();
  const second = host();
  const store = createHandoffStore(first.clerk, scope(first.clerk));
  store.setHost(second.clerk);
  expect(store.getSnapshot().kind).toBe('waiting');
  store.setHost(first.clerk);
  expect(store.getSnapshot().kind).toBe('waiting');
  const other = host();
  other.clerk.publishableKey = 'pk_test_other';
  expect(createHandoffStore(other.clerk, scope(first.clerk)).getSnapshot().kind).toBe('waiting');
});

it('does not expose a seed from an initial loaded host on the client but offers it to server rendering', () => {
  const current = host();
  current.clerk.loaded = true;
  current.clerk.status = 'ready';
  current.clerk.user = { id: 'user_b' };
  current.clerk.session = { id: 'sess_b' };
  const store = createHandoffStore(current.clerk, scope(current.clerk));
  expect(store.getServerSnapshot().kind).toBe('seed');
  expect(store.getSnapshot().kind).toBe('live');
});

it('observes a host that resolves while StrictMode has unsubscribed', () => {
  const current = host();
  const store = createHandoffStore(current.clerk, scope(current.clerk));
  const first = store.subscribe(vi.fn());
  first();
  current.clerk.loaded = true;
  current.clerk.status = 'ready';
  current.clerk.user = { id: 'user_a' };
  current.clerk.session = { id: 'sess_a' };
  const notify = vi.fn();
  const second = store.subscribe(notify);
  expect(store.getSnapshot().kind).toBe('live');
  expect(notify).toHaveBeenCalled();
  second();
});
