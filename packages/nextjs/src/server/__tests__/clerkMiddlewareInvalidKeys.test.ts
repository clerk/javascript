import { automatedEnvironmentVariables } from '@clerk/shared/utils';
import type { NextFetchEvent } from 'next/server';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The mock SHOULD exist before the imports: keys are present but not parseable as Clerk keys, so
// the invalid-key error path is reachable.
vi.mock(import('../constants.js'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    PUBLISHABLE_KEY: 'pk_test_placeholder',
    SECRET_KEY: 'sk_test_placeholder',
  };
});

describe('clerkMiddleware when Clerk env vars are invalid', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    automatedEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const runMiddleware = async () => {
    const { clerkMiddleware } = await import('../clerkMiddleware.js');
    const request = new NextRequest('https://example.com/protected');
    return clerkMiddleware()(request, {} as NextFetchEvent);
  };

  it('throws the invalid-key error pointing at the CLI', async () => {
    await expect(runMiddleware()).rejects.toThrow(/npx clerk@latest init/);
    await expect(runMiddleware()).rejects.toThrow(/\(code=invalid_env_keys\)/);
  });

  it('throws the production invalid-key error pointing at env pull', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await expect(runMiddleware()).rejects.toThrow(/npx clerk@latest env pull --instance prod/);
    await expect(runMiddleware()).rejects.toThrow(/\(code=invalid_env_keys_production\)/);
  });

  it('names the env var and the expected key format in the message', async () => {
    const { invalidEnvKeys, productionInvalidEnvKeys } = await import('../errors.js');
    for (const message of [invalidEnvKeys, productionInvalidEnvKeys]) {
      expect(message).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      expect(message).toContain('pk_test_');
    }
    expect(invalidEnvKeys).toContain('npx clerk@latest init');
    expect(productionInvalidEnvKeys).toContain('npx clerk@latest env pull --instance prod');
  });
});
