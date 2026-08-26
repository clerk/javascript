import type { H3Event } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { completeOnboardingIfClaimed } from '../utils';

const { completeClaimedOnboarding, log, readKeys, completeOnboarding } = vi.hoisted(() => ({
  completeClaimedOnboarding: vi.fn(() => Promise.resolve()),
  log: vi.fn(),
  readKeys: vi.fn(),
  completeOnboarding: vi.fn(),
}));

vi.mock('@clerk/shared/keyless', () => ({
  completeClaimedOnboarding,
  clerkDevelopmentCache: { log },
}));

vi.mock('../index', () => ({
  keyless: () => ({ readKeys, completeOnboarding }),
}));

const event = {} as H3Event;

const storedKeys = {
  publishableKey: 'pk_test_stored',
  secretKey: 'sk_test_stored',
  claimUrl: 'https://dashboard.clerk.com/apps/claim',
  apiKeysUrl: 'https://dashboard.clerk.com/last-active?path=api-keys',
};

describe('completeOnboardingIfClaimed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes onboarding when the configured key matches the stored keyless keys', async () => {
    readKeys.mockReturnValue(storedKeys);

    await completeOnboardingIfClaimed('pk_test_stored', event);

    expect(completeClaimedOnboarding).toHaveBeenCalledTimes(1);
    expect(completeClaimedOnboarding).toHaveBeenCalledWith('pk_test_stored', expect.objectContaining({ readKeys }));
  });

  it('does nothing when the configured key does not match the stored keys', async () => {
    readKeys.mockReturnValue(storedKeys);

    await completeOnboardingIfClaimed('pk_test_other', event);

    expect(completeClaimedOnboarding).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('does nothing when no keyless keys are stored', async () => {
    readKeys.mockReturnValue(undefined);

    await completeOnboardingIfClaimed('pk_test_stored', event);

    expect(completeClaimedOnboarding).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('logs a pointer to the stored keys when no key is configured, without completing onboarding', async () => {
    readKeys.mockReturnValue(storedKeys);

    await completeOnboardingIfClaimed(undefined, event);

    expect(completeClaimedOnboarding).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: 'pk_test_stored_stored',
        msg: expect.stringContaining('.clerk/.tmp/keyless.json'),
      }),
    );
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.stringContaining(storedKeys.claimUrl) }));
  });
});
