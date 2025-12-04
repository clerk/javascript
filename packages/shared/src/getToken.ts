import { inBrowser } from './browser';
import { ClerkRuntimeError } from './errors/clerkRuntimeError';
import { retry } from './retry';
import type { Clerk, ClerkStatus, GetTokenOptions, LoadedClerk } from './types';

const POLL_INTERVAL_MS = 50;
const MAX_POLL_RETRIES = 100;
const STATUS_TIMEOUT_MS = 10000; // 10 second timeout for status changes

function getWindowClerk(): Clerk | undefined {
  if (inBrowser() && 'Clerk' in window) {
    return (window as unknown as { Clerk?: Clerk }).Clerk;
  }
  return undefined;
}

function waitForClerkStatus(clerk: Clerk): Promise<LoadedClerk> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const statusHandler = (status: ClerkStatus) => {
      if (settled) {
        return;
      }

      if (status === 'ready' || status === 'degraded') {
        settled = true;
        clearTimeout(timeoutId);
        clerk.off('status', statusHandler);
        resolve(clerk as LoadedClerk);
      } else if (status === 'error') {
        settled = true;
        clearTimeout(timeoutId);
        clerk.off('status', statusHandler);
        reject(
          new ClerkRuntimeError('Clerk failed to initialize.', {
            code: 'clerk_runtime_init_error',
          }),
        );
      }
    };

    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      clerk.off('status', statusHandler);
      reject(
        new ClerkRuntimeError('Timeout waiting for Clerk to initialize.', {
          code: 'clerk_runtime_load_timeout',
        }),
      );
    }, STATUS_TIMEOUT_MS);

    clerk.on('status', statusHandler, { notify: true });
  });
}

async function waitForClerk(): Promise<LoadedClerk> {
  if (!inBrowser()) {
    throw new ClerkRuntimeError('getToken can only be used in browser environments.', {
      code: 'clerk_runtime_not_browser',
    });
  }

  let clerk: Clerk;
  try {
    clerk = await retry(
      () => {
        const clerk = getWindowClerk();
        if (!clerk) {
          throw new Error('Clerk not found');
        }
        return clerk;
      },
      {
        initialDelay: POLL_INTERVAL_MS,
        factor: 1,
        jitter: false,
        shouldRetry: (_, iterations) => iterations < MAX_POLL_RETRIES,
      },
    );
  } catch {
    throw new ClerkRuntimeError('Timeout waiting for Clerk to load.', {
      code: 'clerk_runtime_load_timeout',
    });
  }

  if (clerk.status === 'ready' || clerk.status === 'degraded') {
    return clerk as LoadedClerk;
  }

  if (clerk.loaded && !clerk.status) {
    return clerk as LoadedClerk;
  }

  return waitForClerkStatus(clerk);
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
