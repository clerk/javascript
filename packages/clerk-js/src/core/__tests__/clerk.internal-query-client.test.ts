import { QueryClient } from '@tanstack/query-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../clerk';
import { Client, Environment } from '../resources/internal';

vi.mock('../resources/Client');
vi.mock('../resources/Environment');

vi.mock('../auth/devBrowser', () => ({
  createDevBrowser: () => ({
    clear: vi.fn(),
    setup: vi.fn(),
    getDevBrowser: vi.fn(() => 'deadbeef'),
    setDevBrowser: vi.fn(),
    removeDevBrowser: vi.fn(),
    refreshCookies: vi.fn(),
  }),
}));

Client.getOrCreateInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn() }));
Environment.getInstance = vi.fn().mockImplementation(() => ({ fetch: vi.fn(() => Promise.resolve({})) }));

const publishableKey = 'pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ';

describe('Clerk __internal_queryClient (backward compat shim)', () => {
  let clerk: Clerk;

  beforeEach(() => {
    clerk = new Clerk(publishableKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns undefined before the lazy import resolves', () => {
    expect(clerk.__internal_queryClient).toBeUndefined();
  });

  it('returns a tagged QueryClient after the lazy import resolves', async () => {
    // Trigger the getter (fires the lazy import)
    void clerk.__internal_queryClient;

    // Wait for the dynamic import and QueryClient construction to settle
    await vi.dynamicImportSettled();

    const result = clerk.__internal_queryClient;
    expect(result).toBeDefined();
    expect(result!.__tag).toBe('clerk-rq-client');
    expect(result!.client).toBeInstanceOf(QueryClient);
  });

  it('returns the same QueryClient instance on repeated access', async () => {
    void clerk.__internal_queryClient;
    await vi.dynamicImportSettled();

    const first = clerk.__internal_queryClient;
    const second = clerk.__internal_queryClient;
    expect(first!.client).toBe(second!.client);
  });

  it('emits queryClientStatus event when the client is ready', async () => {
    const listener = vi.fn();
    // @ts-expect-error - queryClientStatus is not typed on clerk.on
    clerk.on('queryClientStatus', listener);

    void clerk.__internal_queryClient;
    await vi.dynamicImportSettled();

    expect(listener).toHaveBeenCalledWith('ready');
    // @ts-expect-error
    clerk.off('queryClientStatus', listener);
  });
});
