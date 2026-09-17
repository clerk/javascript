import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadHelper = async () => (await import('../completeClaimedOnboarding')).completeClaimedOnboarding;

describe('completeClaimedOnboarding', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    globalThis.__clerk_internal_keyless_logger = undefined;
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    globalThis.__clerk_internal_keyless_logger = undefined;
  });

  it('completes onboarding once per publishable key', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const completeClaimedOnboarding = await loadHelper();
    const completeOnboarding = vi.fn(() => Promise.resolve(null));

    await completeClaimedOnboarding('pk_test_claimed', { completeOnboarding });
    await completeClaimedOnboarding('pk_test_claimed', { completeOnboarding });

    expect(completeOnboarding).toHaveBeenCalledTimes(1);
  });

  it('resolves when the completion request rejects', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const completeClaimedOnboarding = await loadHelper();
    const completeOnboarding = vi.fn(() => Promise.reject(new Error('network')));

    await expect(completeClaimedOnboarding('pk_test_claimed', { completeOnboarding })).resolves.toBeUndefined();
    expect(completeOnboarding).toHaveBeenCalledTimes(1);
  });

  it('logs the claimed confirmation once', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const completeClaimedOnboarding = await loadHelper();
    const completeOnboarding = vi.fn(() => Promise.resolve(null));

    await completeClaimedOnboarding('pk_test_claimed', { completeOnboarding });
    await completeClaimedOnboarding('pk_test_claimed', { completeOnboarding });

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('running with your claimed keys'));
  });
});
