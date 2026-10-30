import { QueryClient } from '@tanstack/query-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Clerk, Resources } from '@/types';
import { createDeferredPromise } from '@/utils/createDeferredPromise';

import {
  __createClerkTestQueryClient,
  __resetClerkQueryClientForTest,
  __setClerkQueryClientForTest,
  getClerkQueryClient,
  registerQueryCleanupOnSignOut,
} from '../clerk-query-client';

afterEach(() => {
  vi.unstubAllGlobals();
  __resetClerkQueryClientForTest();
});

describe('getClerkQueryClient', () => {
  it('returns undefined when window is not defined (SSR)', () => {
    vi.stubGlobal('window', undefined);

    expect(getClerkQueryClient()).toBeUndefined();
  });

  it('does not cache the SSR undefined — a later browser call still creates a client', () => {
    vi.stubGlobal('window', undefined);
    expect(getClerkQueryClient()).toBeUndefined();

    vi.unstubAllGlobals();
    const client = getClerkQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });

  it('lazy-creates a singleton on the browser and returns the same instance on repeated calls', () => {
    const first = getClerkQueryClient();
    const second = getClerkQueryClient();

    expect(first).toBeInstanceOf(QueryClient);
    expect(second).toBe(first);
  });
});

describe('__resetClerkQueryClientForTest', () => {
  it('clears the singleton so the next read lazy-creates a fresh client', () => {
    const original = getClerkQueryClient();
    expect(original).toBeInstanceOf(QueryClient);

    __resetClerkQueryClientForTest();

    const next = getClerkQueryClient();
    expect(next).toBeInstanceOf(QueryClient);
    expect(next).not.toBe(original);
  });
});

describe('__setClerkQueryClientForTest', () => {
  it('installs a caller-supplied client and returns it from getClerkQueryClient', () => {
    const custom = new QueryClient();
    __setClerkQueryClientForTest(custom);

    expect(getClerkQueryClient()).toBe(custom);
  });

  it('installs the "no client" state without triggering lazy creation on subsequent reads', () => {
    __setClerkQueryClientForTest(undefined);

    expect(getClerkQueryClient()).toBeUndefined();
    expect(getClerkQueryClient()).toBeUndefined();
  });
});

describe('__createClerkTestQueryClient', () => {
  it('returns a QueryClient with deterministic defaults and installs it as the singleton', () => {
    const client = __createClerkTestQueryClient();

    expect(client).toBeInstanceOf(QueryClient);
    expect(getClerkQueryClient()).toBe(client);

    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.retry).toBe(false);
    expect(defaults?.staleTime).toBe(Infinity);
    expect(defaults?.refetchOnWindowFocus).toBe(false);
    expect(defaults?.refetchOnReconnect).toBe(false);
    expect(defaults?.refetchOnMount).toBe(false);
  });
});

function resources(user: Clerk['user']): Resources {
  return {
    user,
    get client(): Resources['client'] {
      throw new Error('Sign-out cleanup must not read the client resource');
    },
  };
}

function createClerkListener(user: Clerk['user'] = undefined) {
  const listeners = new Set<Parameters<Clerk['addListener']>[0]>();
  const unsubscribe = vi.fn();
  const clerk = {
    user,
    addListener: vi.fn<Clerk['addListener']>(callback => {
      listeners.add(callback);
      callback(resources(clerk.user));
      return () => {
        listeners.delete(callback);
        unsubscribe();
      };
    }),
  };
  return {
    clerk,
    unsubscribe,
    emit(user: Clerk['user']) {
      clerk.user = user;
      listeners.forEach(callback => callback(resources(user)));
    },
  };
}

describe('registerQueryCleanupOnSignOut', () => {
  it('clears registered authenticated queries on null but ignores unresolved user state', () => {
    const client = __createClerkTestQueryClient();
    const { clerk, emit } = createClerkListener();
    client.setQueryData(['sessions', true], 'private');
    client.setQueryData(['sessions', false], 'public');
    client.setQueryData(['billing', true], 'unrelated');

    registerQueryCleanupOnSignOut(clerk, 'sessions');
    emit(undefined);
    expect(client.getQueryData(['sessions', true])).toBe('private');

    emit(null);
    expect(client.getQueryState(['sessions', true])).toBeUndefined();
    expect(client.getQueryData(['sessions', false])).toBe('public');
    expect(client.getQueryData(['billing', true])).toBe('unrelated');
  });

  it('clears stale entries on initial null and when another prefix registers after sign-out', () => {
    const client = __createClerkTestQueryClient();
    const { clerk } = createClerkListener(null);
    client.setQueryData(['sessions', true], 'private');
    client.setQueryData(['other-sessions', true], 'private');

    registerQueryCleanupOnSignOut(clerk, 'sessions');
    expect(client.getQueryState(['sessions', true])).toBeUndefined();

    registerQueryCleanupOnSignOut(clerk, 'other-sessions');
    expect(client.getQueryState(['other-sessions', true])).toBeUndefined();
    expect(clerk.addListener).toHaveBeenCalledTimes(1);
  });

  it('registers one listener across repeated registrations and clears every registered prefix', () => {
    const client = __createClerkTestQueryClient();
    const { clerk, emit } = createClerkListener();
    registerQueryCleanupOnSignOut(clerk, 'sessions');
    registerQueryCleanupOnSignOut(clerk, 'sessions');
    registerQueryCleanupOnSignOut(clerk, 'other-sessions');
    client.setQueryData(['sessions', true], 'private');
    client.setQueryData(['other-sessions', true], 'private');

    emit(null);

    expect(clerk.addListener).toHaveBeenCalledTimes(1);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });

  it('moves the subscription to a replacement Clerk while retaining registered prefixes', () => {
    const client = __createClerkTestQueryClient();
    const old = createClerkListener();
    const next = createClerkListener();
    registerQueryCleanupOnSignOut(old.clerk, 'sessions');
    registerQueryCleanupOnSignOut(next.clerk, 'other-sessions');
    client.setQueryData(['sessions', true], 'private');
    client.setQueryData(['other-sessions', true], 'private');

    old.emit(null);
    expect(old.unsubscribe).toHaveBeenCalledTimes(1);
    expect(client.getQueryCache().getAll()).toHaveLength(2);

    next.emit(null);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });

  it.each(['reset', 'replace'] as const)('unsubscribes when the query client is %s', action => {
    const original = __createClerkTestQueryClient();
    const { clerk, unsubscribe } = createClerkListener();
    registerQueryCleanupOnSignOut(clerk, 'sessions');
    const callback = clerk.addListener.mock.calls[0]?.[0];
    if (action === 'reset') {
      __resetClerkQueryClientForTest();
    }
    const next = __createClerkTestQueryClient();
    next.setQueryData(['sessions', true], 'new session');
    callback?.(resources(null));

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(next.getQueryData(['sessions', true])).toBe('new session');
    expect(next).not.toBe(original);
  });

  it('does not subscribe without a real query client', () => {
    __setClerkQueryClientForTest(undefined);
    const { clerk } = createClerkListener();

    registerQueryCleanupOnSignOut(clerk, 'sessions');

    expect(clerk.addListener).not.toHaveBeenCalled();
  });

  it('does not restore a removed entry when an in-flight request resolves', async () => {
    const client = __createClerkTestQueryClient();
    const { clerk, emit } = createClerkListener();
    registerQueryCleanupOnSignOut(clerk, 'sessions');
    const deferred = createDeferredPromise();
    const pending = client.fetchQuery({ queryKey: ['sessions', true], queryFn: () => deferred.promise });
    const settled = pending.catch(() => undefined);

    emit(null);
    expect(client.getQueryState(['sessions', true])).toBeUndefined();
    deferred.resolve('stale sessions');
    await settled;
    await deferred.promise;

    expect(client.getQueryState(['sessions', true])).toBeUndefined();
  });
});
