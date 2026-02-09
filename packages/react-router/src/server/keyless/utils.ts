export type { KeylessResult } from '@clerk/shared/keyless';

import { canUseKeyless } from '../../utils/feature-flags';
import type { DataFunctionArgs } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';
import { keyless } from './index';

/**
 * Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  args: DataFunctionArgs,
  options?: ClerkMiddlewareOptions,
) {
  const keylessService = await keyless(args, options);

  // If keyless is not available or not enabled, return configured keys as-is
  if (!keylessService || !canUseKeyless) {
    return {
      publishableKey: configuredPublishableKey,
      secretKey: configuredSecretKey,
      claimUrl: undefined,
      apiKeysUrl: undefined,
    };
  }

  return keylessService.resolveKeysWithKeylessFallback(configuredPublishableKey, configuredSecretKey);
}
