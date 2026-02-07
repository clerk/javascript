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

  if (!isDev || !canUseKeyless) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  // If both keys are explicitly configured, skip all keyless logic
  if (publishableKey && secretKey) {
    return { publishableKey, secretKey, claimUrl, apiKeysUrl };
  }

  const keylessService = await keyless();
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

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
