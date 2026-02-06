import { createKeylessService } from '@clerk/shared/keyless';

import { clerkClient } from '../clerkClient';
import type { DataFunctionArgs } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';
import { createFileStorage } from './fileStorage';

// Singleton with lazy initialization
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;
let keylessInitPromise: Promise<ReturnType<typeof createKeylessService> | null> | null = null;

/**
 * Detects if the current runtime supports file system operations.
 */
function canUseFileSystem(): boolean {
  try {
    return typeof process !== 'undefined' && typeof process.cwd === 'function';
  } catch {
    return false;
  }
}

/**
 * Gets or creates the keyless service instance.
 *
 * Returns null for non-Node.js runtimes (Cloudflare Workers).
 * This function is async because storage creation may involve dynamic imports.
 */
export async function keyless(
  args?: DataFunctionArgs,
  options?: ClerkMiddlewareOptions,
): Promise<ReturnType<typeof createKeylessService> | null> {
  // Guard: Return null for non-Node.js runtimes
  if (!canUseFileSystem()) {
    return null;
  }

  // Return existing instance
  if (keylessServiceInstance) {
    return keylessServiceInstance;
  }

  // Return in-flight initialization
  if (keylessInitPromise) {
    return keylessInitPromise;
  }

  // Initialize service
  keylessInitPromise = (async () => {
    try {
      const storage = await createFileStorage();

      const service = createKeylessService({
        storage,
        api: {
          async createAccountlessApplication(requestHeaders?: Headers) {
            try {
              // Create a default args object if not provided
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
 * Resets the keyless service instance (for testing).
 * @internal
 */
export function resetKeylessService(): void {
  keylessServiceInstance = null;
  keylessInitPromise = null;
}
