import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Create a Proxy that returns a mock object for any property access (nested)
const deepProxy = (): any =>
  new Proxy(
    {},
    {
      get: () => ({}),
    },
  );

// Mock all preset modules to avoid loading real configs
vi.mock('../astro', () => ({ astro: deepProxy() }));
vi.mock('../expo', () => ({ expo: deepProxy() }));
vi.mock('../express', () => ({ express: deepProxy() }));
vi.mock('../hono', () => ({ hono: deepProxy() }));
vi.mock('../next', () => ({ next: deepProxy() }));
vi.mock('../nuxt', () => ({ nuxt: deepProxy() }));
vi.mock('../react', () => ({ react: deepProxy() }));
vi.mock('../react-router', () => ({ reactRouter: deepProxy() }));
vi.mock('../tanstack', () => ({ tanstack: deepProxy() }));
vi.mock('../vue', () => ({ vue: deepProxy() }));

// Mock longRunningApplication to pass through config as-is
vi.mock('../../models/longRunningApplication', () => ({
  longRunningApplication: (params: any) => ({ id: params.id, env: params.env }),
}));

// Mock envs — use a Proxy so any envs.* property returns a unique mock env
const mockIsStagingReady = vi.fn(() => true);
vi.mock('../envs', () => {
  const envProxy = new Proxy(
    {},
    {
      get: (_target, prop: string) => ({ __mockEnvId: prop }),
    },
  );
  return {
    envs: envProxy,
    isStagingReady: (...args: any[]) => mockIsStagingReady(...args),
  };
});

describe('createLongRunningApps', () => {
  let createLongRunningApps: typeof import('../longRunningApps').createLongRunningApps;

  beforeEach(async () => {
    vi.resetModules();
    mockIsStagingReady.mockImplementation(() => true);
    const mod = await import('../longRunningApps');
    createLongRunningApps = mod.createLongRunningApps;
  });

  afterEach(() => {
    delete process.env.E2E_STAGING;
  });

  describe('getByPattern', () => {
    it('returns matching apps for a valid exact pattern', () => {
      const apps = createLongRunningApps();
      const result = apps.getByPattern(['react.vite.withEmailCodes']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('react.vite.withEmailCodes');
    });

    it('returns matching apps for a valid glob pattern', () => {
      const apps = createLongRunningApps();
      const result = apps.getByPattern(['react.vite.*']);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every((r: any) => r.id.startsWith('react.vite.'))).toBe(true);
    });

    it('throws for an invalid pattern (typo) in normal mode', () => {
      const apps = createLongRunningApps();
      expect(() => apps.getByPattern(['react.vite.withEmailCodez'])).toThrow(/Could not find long running app with id/);
    });

    it('throws for an invalid pattern (typo) even when E2E_STAGING=1', () => {
      process.env.E2E_STAGING = '1';
      const apps = createLongRunningApps();
      expect(() => apps.getByPattern(['react.vite.withEmailCodez'])).toThrow(/Could not find long running app with id/);
    });

    it('returns [] for a known app filtered by isStagingReady when E2E_STAGING=1', () => {
      process.env.E2E_STAGING = '1';
      // Filter out all apps (simulates no staging keys)
      mockIsStagingReady.mockImplementation(() => false);
      const apps = createLongRunningApps();
      const result = apps.getByPattern(['react.vite.withEmailCodes']);
      expect(result).toEqual([]);
    });

    it('throws for a known app filtered by isStagingReady without E2E_STAGING', () => {
      // Filter out all apps
      mockIsStagingReady.mockImplementation(() => false);
      const apps = createLongRunningApps();
      expect(() => apps.getByPattern(['react.vite.withEmailCodes'])).toThrow(/Could not find long running app with id/);
    });
  });
});
