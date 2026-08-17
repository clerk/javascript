import { automatedEnvironmentVariables } from '@clerk/shared/utils';
import type { NextFetchEvent } from 'next/server';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The mock SHOULD exist before the imports: unlike clerkMiddleware.test.ts, keys are empty so the
// keyless env error path is reachable.
vi.mock(import('../constants.js'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    PUBLISHABLE_KEY: '',
    SECRET_KEY: '',
  };
});

describe('clerkMiddleware when Clerk env vars are missing', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_CLERK_KEYLESS_DISABLED', undefined);
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

  const runMiddleware = async (headers?: Record<string, string>) => {
    const { clerkMiddleware } = await import('../clerkMiddleware.js');
    const request = new NextRequest('https://example.com/protected', { headers });
    return clerkMiddleware()(request, {} as NextFetchEvent);
  };

  it('throws the setup error pointing at the CLI', async () => {
    await expect(runMiddleware()).rejects.toThrow(/npx clerk@latest init/);
    await expect(runMiddleware()).rejects.toThrow(/\(code=missing_env_keys\)/);
  });

  it('throws the same setup error for machine-token requests', async () => {
    await expect(runMiddleware({ authorization: 'Bearer mt_xxxxxxxx' })).rejects.toThrow(/npx clerk@latest init/);
  });

  it('falls back to the standard missing-key error when keyless is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await expect(runMiddleware()).rejects.toThrow(/publishableKey/i);
  });

  it('names both env vars and the CLI command in the message', async () => {
    const { keylessMissingEnvVars } = await import('../errors.js');
    expect(keylessMissingEnvVars).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    expect(keylessMissingEnvVars).toContain('CLERK_SECRET_KEY');
    expect(keylessMissingEnvVars).toContain('npx clerk@latest init');
  });
});
