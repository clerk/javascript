import type { AccountlessApplication } from '@clerk/shared/keyless';

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

  // In keyless mode, try to read/create keys from the file system
  if (canUseKeyless && (!publishableKey || !secretKey)) {
    const keylessService = keyless();
    const keylessApp: AccountlessApplication | null = await keylessService.getOrCreateKeys();

    if (keylessApp) {
      publishableKey = publishableKey || keylessApp.publishableKey;
      secretKey = secretKey || keylessApp.secretKey;
      claimUrl = keylessApp.claimUrl;
      apiKeysUrl = keylessApp.apiKeysUrl;

      keylessService.logKeylessMessage(keylessApp.claimUrl);
    }
  }

  return { publishableKey, secretKey, claimUrl, apiKeysUrl };
}
