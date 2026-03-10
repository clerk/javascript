import type { Clerk } from '@clerk/clerk-js/no-rhc';

import {
  createClerkClient as _createClerkClient,
  type CreateClerkClientOptions as _CreateClerkClientOptions,
} from '../utils/clerk-client';

/**
 * @deprecated Use `createClerkClient` from `@clerk/chrome-extension/client` with `{ background: true }` instead.
 *
 * @example
 * // Before (deprecated):
 * import { createClerkClient } from '@clerk/chrome-extension/background';
 * const clerk = await createClerkClient({ publishableKey: 'pk_...' });
 *
 * // After:
 * import { createClerkClient } from '@clerk/chrome-extension/client';
 * const clerk = await createClerkClient({ publishableKey: 'pk_...', background: true });
 */
export type CreateClerkClientOptions = Omit<_CreateClerkClientOptions, 'background'>;

/**
 * @deprecated Use `createClerkClient` from `@clerk/chrome-extension/client` with `{ background: true }` instead.
 *
 * @example
 * // Before (deprecated):
 * import { createClerkClient } from '@clerk/chrome-extension/background';
 * const clerk = await createClerkClient({ publishableKey: 'pk_...' });
 *
 * // After:
 * import { createClerkClient } from '@clerk/chrome-extension/client';
 * const clerk = await createClerkClient({ publishableKey: 'pk_...', background: true });
 */
export function createClerkClient(opts: CreateClerkClientOptions): Promise<Clerk> {
  return _createClerkClient({ ...opts, background: true }) as Promise<Clerk>;
}
