import { inBrowser } from './browser';
import type { ClerkStatus, GetTokenOptions, LoadedClerk } from './types';

const POLL_INTERVAL_MS = 50;
const MAX_POLL_RETRIES = 100; // 5 seconds of polling
const TIMEOUT_MS = 10000; // 10 second absolute timeout

type WindowClerk = LoadedClerk & {
  status?: ClerkStatus;
  loaded?: boolean;
  on?: (event: 'status', handler: (status: ClerkStatus) => void, opts?: { notify?: boolean }) => void;
  off?: (event: 'status', handler: (status: ClerkStatus) => void) => void;
};

function getWindowClerk(): WindowClerk | undefined {
  if (inBrowser() && 'Clerk' in window) {
    return (window as unknown as { Clerk?: WindowClerk }).Clerk;
  }
  return undefined;
}

class ClerkNotLoadedError extends Error {
  constructor() {
    super('Clerk: Timeout waiting for Clerk to load. Ensure ClerkProvider is mounted.');
    this.name = 'ClerkNotLoadedError';
  }
}

class ClerkNotAvailableError extends Error {
  constructor() {
    super('Clerk: getToken can only be used in browser environments.');
    this.name = 'ClerkNotAvailableError';
  }
}

function waitForClerk(): Promise<LoadedClerk> {
  return new Promise((resolve, reject) => {
    if (!inBrowser()) {
      reject(new ClerkNotAvailableError());
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
    let timeoutId: ReturnType<typeof setTimeout>;
    let statusHandler: ((status: ClerkStatus) => void) | undefined;
    let pollTimeoutId: ReturnType<typeof setTimeout>;
    let currentClerk: WindowClerk | undefined = clerk;

    const cleanup = () => {
      clearTimeout(timeoutId);
      clearTimeout(pollTimeoutId);
      if (statusHandler && currentClerk?.off) {
        currentClerk.off('status', statusHandler);
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new ClerkNotLoadedError());
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

      if (!statusHandler && currentClerk.on) {
        statusHandler = (status: ClerkStatus) => {
          if (status === 'ready' || status === 'degraded') {
            cleanup();
            resolve(currentClerk as LoadedClerk);
          } else if (status === 'error') {
            cleanup();
            reject(new ClerkNotLoadedError());
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
 * @returns A Promise that resolves to the session token, or `null` if:
 *   - The user is not signed in
 *   - Clerk failed to load
 *   - Called in a non-browser environment
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
  try {
    const clerk = await waitForClerk();

    if (!clerk.session) {
      return null;
    }

    return await clerk.session.getToken(options);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Clerk] getToken failed:', error);
    }
    return null;
  }
}
