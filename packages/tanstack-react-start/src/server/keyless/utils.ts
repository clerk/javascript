import type { AccountlessApplication } from '@clerk/shared/keyless';
import { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } from '@clerk/shared/keyless';

import { canUseKeyless } from '../../utils/feature-flags';
import { keyless } from './index';

export interface KeylessResult {
  publishableKey: string | undefined;
  secretKey: string | undefined;
  claimUrl: string | undefined;
  apiKeysUrl: string | undefined;
}

/**
 * Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
 *
 * @param configuredPublishableKey - The publishable key from options or environment
 * @param configuredSecretKey - The secret key from options or environment
 * @returns The resolved keys (either configured or from keyless mode)
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
): Promise<KeylessResult> {
  let publishableKey = configuredPublishableKey;
  let secretKey = configuredSecretKey;
  let claimUrl: string | undefined;
  let apiKeysUrl: string | undefined;

  if (!canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  console.log({ publishableKey, configuredPublishableKey });
  console.log({ secretKey, configuredSecretKey });

  const keylessService = keyless();
  const locallyStoredKeys = keylessService.readKeys();

  // Check if running with claimed keys (configured keys match locally stored keyless keys)
  const runningWithClaimedKeys =
    Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey;

  if (runningWithClaimedKeys && locallyStoredKeys) {
    // Complete onboarding when running with claimed keys
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

    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  // In keyless mode, try to read/create keys from the file system
  if (!publishableKey || !secretKey) {
    const keylessApp: AccountlessApplication | null = await keylessService.getOrCreateKeys();

    if (keylessApp) {
      publishableKey = publishableKey || keylessApp.publishableKey;
      secretKey = secretKey || keylessApp.secretKey;
      claimUrl = keylessApp.claimUrl;
      apiKeysUrl = keylessApp.apiKeysUrl;

      clerkDevelopmentCache?.log({
        cacheKey: keylessApp.publishableKey,
        msg: createKeylessModeMessage(keylessApp),
      });
    }
  }

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
