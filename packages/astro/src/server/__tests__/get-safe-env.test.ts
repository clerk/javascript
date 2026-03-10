import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getClientSafeEnv, getSafeEnv } from '../get-safe-env';

function createLocals(overrides: Partial<App.Locals> = {}): App.Locals {
  return {
    runtime: { env: {} as InternalEnv },
    ...overrides,
  } as unknown as App.Locals;
}

describe('get-safe-env', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initCloudflareEnv', () => {
    it('caches env from cloudflare:workers when available', async () => {
      vi.doMock('cloudflare:workers', () => ({
        env: { CLERK_SECRET_KEY: 'sk_test_cf' },
      }));

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');

      await initCloudflareEnv();

      const env = getSafeEnv({ locals: {} } as any);
      expect(env.sk).toBe('sk_test_cf');
    });

    it('sets cache to null when cloudflare:workers is not available', async () => {
      vi.doMock('cloudflare:workers', () => {
        throw new Error('Module not found');
      });

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');

      await initCloudflareEnv();

      // Should fall through to import.meta.env (undefined in test)
      const env = getSafeEnv({ locals: {} } as any);
      expect(env.sk).toBeUndefined();
    });

    it('only imports once (caches result)', async () => {
      let importCount = 0;
      vi.doMock('cloudflare:workers', () => {
        importCount++;
        return { env: { CLERK_SECRET_KEY: 'sk_test_cf' } };
      });

      const { initCloudflareEnv } = await import('../get-safe-env');

      await initCloudflareEnv();
      await initCloudflareEnv();
      await initCloudflareEnv();

      expect(importCount).toBe(1);
    });

    it('only imports once even when cloudflare:workers throws', async () => {
      let importCount = 0;
      vi.doMock('cloudflare:workers', () => {
        importCount++;
        throw new Error('Module not found');
      });

      const { initCloudflareEnv } = await import('../get-safe-env');

      await initCloudflareEnv();
      await initCloudflareEnv();

      expect(importCount).toBe(1);
    });
  });

  describe('getContextEnvVar fallback chain', () => {
    it('reads from locals.runtime.env (Astro v4/v5)', async () => {
      const { getSafeEnv } = await import('../get-safe-env');
      const locals = { runtime: { env: { CLERK_SECRET_KEY: 'sk_from_runtime' } } };

      const env = getSafeEnv({ locals } as any);
      expect(env.sk).toBe('sk_from_runtime');
    });

    it('falls back to cloudflareEnv when locals.runtime.env is absent', async () => {
      vi.doMock('cloudflare:workers', () => ({
        env: { CLERK_SECRET_KEY: 'sk_from_cf_workers' },
      }));

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');
      await initCloudflareEnv();

      const env = getSafeEnv({ locals: {} } as any);
      expect(env.sk).toBe('sk_from_cf_workers');
    });

    it('falls back to cloudflareEnv when locals.runtime throws (Astro v6)', async () => {
      vi.doMock('cloudflare:workers', () => ({
        env: { CLERK_SECRET_KEY: 'sk_from_cf_workers' },
      }));

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');
      await initCloudflareEnv();

      // Simulate Astro v6 behavior: accessing runtime throws
      const locals = new Proxy(
        {},
        {
          get(_, prop) {
            if (prop === 'runtime') {
              throw new Error('locals.runtime is not available in Astro v6 Cloudflare');
            }
            return undefined;
          },
        },
      );

      const env = getSafeEnv({ locals } as any);
      expect(env.sk).toBe('sk_from_cf_workers');
    });

    it('prefers cloudflareEnv over locals.runtime.env', async () => {
      vi.doMock('cloudflare:workers', () => ({
        env: { CLERK_SECRET_KEY: 'sk_from_cf_workers' },
      }));

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');
      await initCloudflareEnv();

      const locals = { runtime: { env: { CLERK_SECRET_KEY: 'sk_from_runtime' } } };
      const env = getSafeEnv({ locals } as any);
      expect(env.sk).toBe('sk_from_cf_workers');
    });
  });
});

describe('getSafeEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', '');
    vi.stubEnv('CLERK_SECRET_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads from locals.runtime.env first (Cloudflare)', () => {
    const locals = createLocals({
      runtime: {
        env: {
          PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_from_runtime',
          CLERK_SECRET_KEY: 'sk_from_runtime',
        } as InternalEnv,
      },
    });

    // Also set process.env to verify runtime.env takes priority
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';
    process.env.CLERK_SECRET_KEY = 'sk_from_process';

    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_from_runtime');
    expect(env.sk).toBe('sk_from_runtime');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('reads from process.env when runtime.env is not available', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';
    process.env.CLERK_SECRET_KEY = 'sk_from_process';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_from_process');
    expect(env.sk).toBe('sk_from_process');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('returns undefined when no env source has the value', () => {
    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.CLERK_SECRET_KEY;

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getSafeEnv(locals);

    expect(env.pk).toBeUndefined();
    expect(env.sk).toBeUndefined();
  });

  it('prefers keylessPublishableKey over all env sources', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';

    const locals = createLocals({
      runtime: { env: undefined as unknown as InternalEnv },
      keylessPublishableKey: 'pk_keyless',
    });
    const env = getSafeEnv(locals);

    expect(env.pk).toBe('pk_keyless');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  });
});

describe('getClientSafeEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_CLERK_PUBLISHABLE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads from process.env for publishableKey', () => {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_from_process';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getClientSafeEnv(locals);

    expect(env.publishableKey).toBe('pk_from_process');

    delete process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  });

  it('reads from process.env for all public env vars', () => {
    process.env.PUBLIC_CLERK_DOMAIN = 'test.domain.com';
    process.env.PUBLIC_CLERK_SIGN_IN_URL = '/sign-in';
    process.env.PUBLIC_CLERK_SIGN_UP_URL = '/sign-up';

    const locals = createLocals({ runtime: { env: undefined as unknown as InternalEnv } });
    const env = getClientSafeEnv(locals);

    expect(env.domain).toBe('test.domain.com');
    expect(env.signInUrl).toBe('/sign-in');
    expect(env.signUpUrl).toBe('/sign-up');

    delete process.env.PUBLIC_CLERK_DOMAIN;
    delete process.env.PUBLIC_CLERK_SIGN_IN_URL;
    delete process.env.PUBLIC_CLERK_SIGN_UP_URL;
  });
});
