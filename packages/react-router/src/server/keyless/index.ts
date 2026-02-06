import { createKeylessService } from '@clerk/shared/keyless';

import { clerkClient } from '../clerkClient';
import type { DataFunctionArgs } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';
import { createFileStorage } from './fileStorage';

let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;
let keylessInitPromise: Promise<ReturnType<typeof createKeylessService> | null> | null = null;

function canUseFileSystem(): boolean {
  try {
    return typeof process !== 'undefined' && typeof process.cwd === 'function';
  } catch {
    return false;
  }
}

/**
 * Gets or creates the keyless service singleton.
 * Returns null for non-Node.js runtimes (e.g., Cloudflare Workers).
 */
export async function keyless(
  args?: DataFunctionArgs,
  options?: ClerkMiddlewareOptions,
): Promise<ReturnType<typeof createKeylessService> | null> {
  if (!canUseFileSystem()) {
    return null;
  }

  if (keylessServiceInstance) {
    return keylessServiceInstance;
  }

  if (keylessInitPromise) {
    return keylessInitPromise;
  }

  keylessInitPromise = (async () => {
    try {
      const storage = await createFileStorage();

      const service = createKeylessService({
        storage,
        api: {
          async createAccountlessApplication(requestHeaders?: Headers) {
            try {
              const client = args ? clerkClient(args, options) : clerkClient({} as any, options);
              return await client.__experimental_accountlessApplications.createAccountlessApplication({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
          async completeOnboarding(requestHeaders?: Headers) {
            try {
              const client = args ? clerkClient(args, options) : clerkClient({} as any, options);
              return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
        },
        framework: 'react-router',
        frameworkVersion: PACKAGE_VERSION,
      });

      keylessServiceInstance = service;
      return service;
    } catch (error) {
      console.warn('[Clerk] Failed to initialize keyless service:', error);
      return null;
    } finally {
      keylessInitPromise = null;
    }
  })();

  return keylessInitPromise;
}

/**
 * @internal
 */
export function resetKeylessService(): void {
  keylessServiceInstance = null;
  keylessInitPromise = null;
}
