import { clerkDevelopmentCache, createConfirmationMessage } from '@clerk/shared/keyless';
import type { APIContext } from 'astro';

import { canUseKeyless } from '../../utils/feature-flags';
import { keyless } from './index';

/**
 * Notifies the dashboard that a claimed keyless application is now running with its
 * keys configured, and logs a one-time confirmation. No-ops unless the configured
 * publishable key matches the locally stored keyless keys.
 */
export async function completeOnboardingIfClaimed(
  configuredPublishableKey: string | undefined,
  context: APIContext,
): Promise<void> {
  if (!canUseKeyless || !configuredPublishableKey) {
    return;
  }

  const keylessService = keyless(context);
  const locallyStoredKeys = keylessService.readKeys();
  if (locallyStoredKeys?.publishableKey !== configuredPublishableKey) {
    return;
  }

  try {
    await clerkDevelopmentCache?.run(() => keylessService.completeOnboarding(), {
      cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
      onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
    });
  } catch {
    // noop
  }

  clerkDevelopmentCache?.log({
    cacheKey: `${locallyStoredKeys.publishableKey}_claimed`,
    msg: createConfirmationMessage(),
  });
}
