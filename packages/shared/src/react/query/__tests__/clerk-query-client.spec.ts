import { QueryClient } from '@tanstack/query-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  __createClerkTestQueryClient,
  __resetClerkQueryClientForTest,
  __setClerkQueryClientForTest,
  getClerkQueryClient,
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
