import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

    it('prefers locals.runtime.env over cloudflareEnv', async () => {
      vi.doMock('cloudflare:workers', () => ({
        env: { CLERK_SECRET_KEY: 'sk_from_cf_workers' },
      }));

      const { initCloudflareEnv, getSafeEnv } = await import('../get-safe-env');
      await initCloudflareEnv();

      const locals = { runtime: { env: { CLERK_SECRET_KEY: 'sk_from_runtime' } } };
      const env = getSafeEnv({ locals } as any);
      expect(env.sk).toBe('sk_from_runtime');
    });
  });
});
