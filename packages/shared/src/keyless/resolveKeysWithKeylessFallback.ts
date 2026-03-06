import { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } from './devCache';
import type { KeylessService } from './service';
import type { AccountlessApplication } from './types';

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
 * @param keylessService - The keyless service instance (or null if unavailable)
 * @param canUseKeyless - Whether keyless mode is enabled in the current environment
 * @returns The resolved keys (either configured or from keyless mode)
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  keylessService: KeylessService | null,
  canUseKeyless: boolean,
): Promise<KeylessResult> {
  let publishableKey = configuredPublishableKey;
  let secretKey = configuredSecretKey;
  let claimUrl: string | undefined;
  let apiKeysUrl: string | undefined;

  if (!canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  if (!keylessService) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  try {
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
    if (!publishableKey && !secretKey) {
      const keylessApp: AccountlessApplication | null = await keylessService.getOrCreateKeys();

      if (keylessApp) {
        publishableKey = keylessApp.publishableKey;
        secretKey = keylessApp.secretKey;
        claimUrl = keylessApp.claimUrl;
        apiKeysUrl = keylessApp.apiKeysUrl;

        clerkDevelopmentCache?.log({
          cacheKey: keylessApp.publishableKey,
          msg: createKeylessModeMessage(keylessApp),
        });
      }
    }
  } catch {
    // noop - fall through to return whatever keys we have
  }

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
