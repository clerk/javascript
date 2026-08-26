import { clerkDevelopmentCache, completeClaimedOnboarding } from '@clerk/shared/keyless';

import { keyless } from './index';

/**
 * Notifies the dashboard that a claimed keyless application is now running with its
 * keys configured. When no key is configured but stored keyless keys exist, logs a
 * one-time pointer to them instead (the missing-key error throws downstream).
 */
export async function completeOnboardingIfClaimed(configuredPublishableKey: string | undefined): Promise<void> {
  const keylessService = keyless();
  const locallyStoredKeys = keylessService.readKeys();
  if (!locallyStoredKeys) {
    return;
  }

  if (!configuredPublishableKey) {
    clerkDevelopmentCache?.log({
      cacheKey: `${locallyStoredKeys.publishableKey}_stored`,
      msg: `[Clerk]: Found existing keyless-mode keys in .clerk/.tmp/keyless.json. Copy the publishableKey and secretKey into .env (CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY) to keep using that application, or claim it at ${locallyStoredKeys.claimUrl}`,
    });
    return;
  }

  if (locallyStoredKeys.publishableKey !== configuredPublishableKey) {
    return;
  }

  await completeClaimedOnboarding(locallyStoredKeys.publishableKey, keylessService);
}
