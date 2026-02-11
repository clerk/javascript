import { createKeylessService } from '@clerk/shared/keyless';
import type { H3Event } from 'h3';

import { clerkClient } from '../clerkClient';
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
export async function keyless(event: H3Event): Promise<ReturnType<typeof createKeylessService> | null> {
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
              return await clerkClient(event).__experimental_accountlessApplications.createAccountlessApplication({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
          async completeOnboarding(requestHeaders?: Headers) {
            try {
              return await clerkClient(
                event,
              ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
        },
        framework: 'nuxt',
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
