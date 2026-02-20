import { resolveKeysWithKeylessFallback as sharedResolveKeysWithKeylessFallback } from '@clerk/shared/keyless';
import type { H3Event } from 'h3';

import { canUseKeyless } from '../../utils/feature-flags';
import { keyless } from './index';

export type { KeylessResult } from '@clerk/shared/keyless';

/**
 * Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  event: H3Event,
) {
  const keylessService = await keyless(event);
  return sharedResolveKeysWithKeylessFallback(
    configuredPublishableKey,
    configuredSecretKey,
    keylessService,
    canUseKeyless,
  );
}
