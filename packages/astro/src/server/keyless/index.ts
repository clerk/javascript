import { createClerkClient } from '@clerk/backend';
import { createKeylessService } from '@clerk/shared/keyless';
import type { APIContext } from 'astro';

import type { ClerkAstroMiddlewareOptions } from '../clerk-middleware';
import { createFileStorage } from './file-storage.js';

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
  context: APIContext,
  options?: ClerkAstroMiddlewareOptions,
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
              // Reuse existing clerkClient factory with keys from process.env
              const client = createClerkClient({
                secretKey: process.env.CLERK_SECRET_KEY,
                publishableKey: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
                apiUrl: process.env.CLERK_API_URL,
                userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
              });
              return await client.__experimental_accountlessApplications.createAccountlessApplication({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
          async completeOnboarding(requestHeaders?: Headers) {
            try {
              // Reuse existing clerkClient factory with keys from process.env
              const client = createClerkClient({
                secretKey: process.env.CLERK_SECRET_KEY,
                publishableKey: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
                apiUrl: process.env.CLERK_API_URL,
                userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
              });
              return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
                requestHeaders,
              });
            } catch {
              return null;
            }
          },
        },
        framework: 'astro',
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
