import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadCanUseKeyless() {
  vi.resetModules();
  const { canUseKeyless } = await import('../feature-flags.js');
  return canUseKeyless;
}

describe('canUseKeyless', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('disables keyless in CI even when the app runs in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CI', 'true');

    await expect(loadCanUseKeyless()).resolves.toBe(false);
  });
});
