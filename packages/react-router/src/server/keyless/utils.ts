import type { AccountlessApplication } from '@clerk/shared/keyless';
import { clerkDevelopmentCache, createConfirmationMessage, createKeylessModeMessage } from '@clerk/shared/keyless';

import { canUseKeyless } from '../../utils/feature-flags';
import type { DataFunctionArgs } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';
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
 * Implements the TanStack keyless pattern:
 * 1. Check if keyless mode is enabled (dev + not disabled)
 * 2. If running with claimed keys (configured === stored), complete onboarding
 * 3. If no keys configured, create/read keyless keys from storage
 * 4. Return resolved keys + keyless URLs
 *
 * @returns The resolved keys + keyless URLs to inject into state
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  args?: DataFunctionArgs,
  options?: ClerkMiddlewareOptions,
): Promise<KeylessResult> {
  let publishableKey = configuredPublishableKey;
  let secretKey = configuredSecretKey;
  let claimUrl: string | undefined;
  let apiKeysUrl: string | undefined;

  // Early return if keyless is disabled
  if (!canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  try {
    const keylessService = await keyless(args, options);

    // Early return if keyless service unavailable (e.g., Cloudflare)
    if (!keylessService) {
      return { publishableKey, secretKey, claimUrl, apiKeysUrl };
    }

    const locallyStoredKeys = keylessService.readKeys();

    // Scenario 1: Running with claimed keys
    const runningWithClaimedKeys =
      Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey;

    if (runningWithClaimedKeys && locallyStoredKeys) {
      // Complete onboarding (throttled by dev cache)
      try {
        await clerkDevelopmentCache?.run(() => keylessService.completeOnboarding(), {
          cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
          onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
        });
      } catch {
        // noop - non-critical
      }

      clerkDevelopmentCache?.log({
        cacheKey: `${locallyStoredKeys.publishableKey}_claimed`,
        msg: createConfirmationMessage(),
      });

      return { publishableKey, secretKey, claimUrl, apiKeysUrl };
    }

    // Scenario 2: Keyless mode (no keys configured)
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
  } catch (error) {
    // Graceful fallback - never break the app
    console.warn('[Clerk] Keyless resolution failed:', error);
  }

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
