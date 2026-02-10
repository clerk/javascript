import { resolveKeysWithKeylessFallback as sharedResolveKeysWithKeylessFallback } from '@clerk/shared/keyless';
import type { APIContext } from 'astro';
export type { KeylessResult } from '@clerk/shared/keyless';

import { canUseKeyless } from '../../utils/feature-flags';
import type { ClerkAstroMiddlewareOptions } from '../clerk-middleware';
import { keyless } from './index';

/**
 * Resolves Clerk keys, falling back to keyless mode in development if configured keys are missing.
 */
export async function resolveKeysWithKeylessFallback(
  configuredPublishableKey: string | undefined,
  configuredSecretKey: string | undefined,
  context: APIContext,
  options?: ClerkAstroMiddlewareOptions,
) {
  const keylessService = await keyless(context, options);
  return sharedResolveKeysWithKeylessFallback(
    configuredPublishableKey,
    configuredSecretKey,
    keylessService,
    canUseKeyless,
  );
}
