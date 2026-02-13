import { resolveKeysWithKeylessFallback as sharedResolveKeysWithKeylessFallback } from '@clerk/shared/keyless';
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
  return sharedResolveKeysWithKeylessFallback(
    configuredPublishableKey,
    configuredSecretKey,
    keylessService,
    canUseKeyless,
  );
}
