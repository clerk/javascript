import { QueryClient } from '@tanstack/query-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../core/resources/Client');
vi.mock('../core/resources/Environment');

describe('index.native', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('overrides __internal_queryClient to return synchronously', async () => {
    const { Clerk } = await import('../index.native');
    const clerk = new Clerk('pk_test_Y2xlcmsuZXhhbXBsZS5jb20k');

    const result = clerk.__internal_queryClient;

    expect(result).toBeDefined();
    expect(result?.__tag).toBe('clerk-rq-client');
    expect(result?.client).toBeInstanceOf(QueryClient);
  });

  it('returns the same QueryClient instance on subsequent accesses', async () => {
    const { Clerk } = await import('../index.native');
    const clerk = new Clerk('pk_test_Y2xlcmsuZXhhbXBsZS5jb20k');

    const first = clerk.__internal_queryClient;
    const second = clerk.__internal_queryClient;

    expect(first?.client).toBe(second?.client);
  });

  it('returns different QueryClient instances for different Clerk instances', async () => {
    const { Clerk } = await import('../index.native');
    const clerk1 = new Clerk('pk_test_Y2xlcmsuZXhhbXBsZS5jb20k');
    const clerk2 = new Clerk('pk_test_Y2xlcmsuZXhhbXBsZS5jb20k');

    const client1 = clerk1.__internal_queryClient;
    const client2 = clerk2.__internal_queryClient;

    expect(client1?.client).not.toBe(client2?.client);
  });

  it('exports the same public API as the base entry point', async () => {
    const nativeExports = await import('../index.native');
    const baseExports = await import('../index');

    const nativeKeys = Object.keys(nativeExports).sort();
    const baseKeys = Object.keys(baseExports).sort();

    expect(nativeKeys).toEqual(baseKeys);
  });
});
