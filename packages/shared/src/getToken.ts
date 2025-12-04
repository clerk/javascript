import { inBrowser } from './browser';
import { ClerkRuntimeError } from './errors/clerkRuntimeError';
import type { Clerk, ClerkStatus, GetTokenOptions, LoadedClerk } from './types';

const POLL_INTERVAL_MS = 50;
const MAX_POLL_RETRIES = 100; // 5 seconds of polling
const TIMEOUT_MS = 10000; // 10 second absolute timeout

function getWindowClerk(): Clerk | undefined {
  if (inBrowser() && 'Clerk' in window) {
    return (window as unknown as { Clerk?: Clerk }).Clerk;
  }
  return undefined;
}

function waitForClerk(): Promise<LoadedClerk> {
  return new Promise((resolve, reject) => {
    if (!inBrowser()) {
      reject(
        new ClerkRuntimeError('getToken can only be used in browser environments.', {
          code: 'clerk_runtime_not_browser',
        }),
      );
      return;
    }

    const clerk = getWindowClerk();

    if (clerk && (clerk.status === 'ready' || clerk.status === 'degraded')) {
      resolve(clerk as LoadedClerk);
      return;
    }

    if (clerk && clerk.loaded && !clerk.status) {
      resolve(clerk as LoadedClerk);
      return;
    }

    let retries = 0;
    let statusHandler: ((status: ClerkStatus) => void) | undefined;
    let pollTimeoutId: ReturnType<typeof setTimeout>;
    let currentClerk: Clerk | undefined = clerk;

    const cleanup = () => {
      clearTimeout(timeoutId);
      clearTimeout(pollTimeoutId);
      if (statusHandler && currentClerk) {
        currentClerk.off('status', statusHandler);
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(
        new ClerkRuntimeError('Timeout waiting for Clerk to load.', {
          code: 'clerk_runtime_load_timeout',
        }),
      );
    }, TIMEOUT_MS);

    const checkAndResolve = () => {
      currentClerk = getWindowClerk();

      if (!currentClerk) {
        if (retries < MAX_POLL_RETRIES) {
          retries++;
          pollTimeoutId = setTimeout(checkAndResolve, POLL_INTERVAL_MS);
        }
        return;
      }

      if (currentClerk.status === 'ready' || currentClerk.status === 'degraded') {
        cleanup();
        resolve(currentClerk as LoadedClerk);
        return;
      }

      if (currentClerk.loaded && !currentClerk.status) {
        cleanup();
        resolve(currentClerk as LoadedClerk);
        return;
      }

      if (!statusHandler) {
        statusHandler = (status: ClerkStatus) => {
          if (status === 'ready' || status === 'degraded') {
            cleanup();
            resolve(currentClerk as LoadedClerk);
          } else if (status === 'error') {
            cleanup();
            reject(
              new ClerkRuntimeError('Clerk failed to initialize.', {
                code: 'clerk_runtime_init_error',
              }),
            );
          }
        };

        currentClerk.on('status', statusHandler, { notify: true });
      }
    };

    checkAndResolve();
  });
}

/**
 * Retrieves the current session token, waiting for Clerk to initialize if necessary.
 *
 * This function is safe to call from anywhere in the browser
 *
 * @param options - Optional configuration for token retrieval
 * @param options.template - The name of a JWT template to use
 * @param options.organizationId - Organization ID to include in the token
 * @param options.leewayInSeconds - Number of seconds of leeway for token expiration
 * @param options.skipCache - Whether to skip the token cache
 * @returns A Promise that resolves to the session token, or `null` if the user is not signed in
 *
 * @throws {ClerkRuntimeError} When called in a non-browser environment (code: `clerk_runtime_not_browser`)
 *
 * @throws {ClerkRuntimeError} When Clerk fails to load within timeout (code: `clerk_runtime_load_timeout`)
 *
 * @throws {ClerkRuntimeError} When Clerk fails to initialize (code: `clerk_runtime_init_error`)
 *
 * @example
 * ```typescript
 * // In an Axios interceptor
 * import { getToken } from '@clerk/nextjs';
 *
 * axios.interceptors.request.use(async (config) => {
 *   const token = await getToken();
 *   if (token) {
 *     config.headers.Authorization = `Bearer ${token}`;
 *   }
 *   return config;
 * });
 * ```
 */
export async function getToken(options?: GetTokenOptions): Promise<string | null> {
  const clerk = await waitForClerk();

  if (!clerk.session) {
    return null;
  }

  return clerk.session.getToken(options);
}
