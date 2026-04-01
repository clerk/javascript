import { resolveKeysWithKeylessFallback as sharedResolveKeysWithKeylessFallback } from '@clerk/shared/keyless';
export type { KeylessResult } from '@clerk/shared/keyless';

import { canUseKeyless } from '../../utils/feature-flags';
import { keyless } from './index';

/**
 * Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
 *
 * @param configuredPublishableKey - The publishable key from options or environment
 * @param configuredSecretKey - The secret key from options or environment
 * @returns The resolved keys (either configured or from keyless mode)
 */
export function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
) {
  return sharedResolveKeysWithKeylessFallback(configuredPublishableKey, configuredSecretKey, keyless(), canUseKeyless);
}
