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

export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  isDev: boolean = false,
): Promise<KeylessResult> {
  let publishableKey = configuredPublishableKey;
  let secretKey = configuredSecretKey;
  let claimUrl: string | undefined;
  let apiKeysUrl: string | undefined;

  console.log('[Keyless Debug] Input:', {
    hasPublishableKey: Boolean(configuredPublishableKey),
    hasSecretKey: Boolean(configuredSecretKey),
    isDev,
    canUseKeyless,
  });

  if (!isDev || !canUseKeyless) {
    console.log('[Keyless Debug] Early return - not dev or keyless disabled');
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  // If both keys are explicitly configured, skip all keyless logic
  if (publishableKey && secretKey) {
    console.log('[Keyless Debug] Both keys configured, skipping keyless');
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  const keylessService = await keyless();
  const locallyStoredKeys = keylessService.readKeys();

  console.log('[Keyless Debug] Stored keys:', {
    hasStoredKeys: Boolean(locallyStoredKeys),
    storedPublishableKey: locallyStoredKeys?.publishableKey?.substring(0, 20) + '...',
  });

  const runningWithClaimedKeys =
    Boolean(configuredPublishableKey) && configuredPublishableKey === locallyStoredKeys?.publishableKey;

  console.log('[Keyless Debug] Running with claimed keys:', runningWithClaimedKeys);

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

    console.log('[Keyless Debug] Returning claimed keys (no keyless URLs)');
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  console.log('[Keyless Debug] Checking if need to create keyless app');

  if (!publishableKey && !secretKey) {
    console.log('[Keyless Debug] Creating keyless app (no keys configured)');
    const keylessApp: AccountlessApplication | null = await keylessService.getOrCreateKeys();

    if (keylessApp) {
      publishableKey = keylessApp.publishableKey;
      secretKey = keylessApp.secretKey;
      claimUrl = keylessApp.claimUrl;
      apiKeysUrl = keylessApp.apiKeysUrl;

      console.log('[Keyless Debug] Keyless app created/retrieved with URLs');

      clerkDevelopmentCache?.log({
        cacheKey: keylessApp.publishableKey,
        msg: createKeylessModeMessage(keylessApp),
      });
    }
  } else {
    console.log('[Keyless Debug] Skipping keyless app creation (keys already configured)');
  }

  console.log('[Keyless Debug] Final return:', {
    hasPublishableKey: Boolean(publishableKey),
    hasSecretKey: Boolean(secretKey),
    hasClaimUrl: Boolean(claimUrl),
    hasApiKeysUrl: Boolean(apiKeysUrl),
  });

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
