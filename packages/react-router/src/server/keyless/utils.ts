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

  if (!canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  try {
    const keylessService = await keyless(args, options);

    if (!keylessService) {
      return { publishableKey, secretKey, claimUrl, apiKeysUrl };
    }

    const locallyStoredKeys = keylessService.readKeys();

    const runningWithClaimedKeys =
      Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey;

    if (runningWithClaimedKeys && locallyStoredKeys) {
      try {
        await clerkDevelopmentCache?.run(() => keylessService.completeOnboarding(), {
          cacheKey: `${locallyStoredKeys.publishableKey}_complete`,
          onSuccessStale: 24 * 60 * 60 * 1000,
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
    console.warn('[Clerk] Keyless resolution failed:', error);
  }

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
