import { inBrowser } from './browser';
import { ClerkRuntimeError } from './errors/clerkRuntimeError';
import type { GetTokenOptions, LoadedClerk } from './types';

const TIMEOUT_MS = 10000; // 10 second timeout for Clerk to load

/**
 * A promise that includes resolve/reject callbacks for external resolution.
 * Used for coordination between getToken() and clerk-js initialization.
 */
type ClerkReadyPromise = Promise<LoadedClerk> & {
  __resolve?: (clerk: LoadedClerk) => void;
  __reject?: (error: Error) => void;
};

/**
 * Local Window type extension for __clerk_internal_ready coordination.
 * Avoids global augmentation to prevent declaration collisions for consumers.
 */
interface ClerkWindow extends Window {
  __clerk_internal_ready?: ClerkReadyPromise;
}

function getWindowClerk(): LoadedClerk | undefined {
  if (inBrowser() && 'Clerk' in window) {
    const clerk = (window as unknown as { Clerk?: LoadedClerk }).Clerk;
    if (clerk && (clerk.status === 'ready' || clerk.status === 'degraded')) {
      return clerk;
    }
    // Legacy fallback for older clerk-js versions without status
    if (clerk?.loaded && !clerk.status) {
      return clerk;
    }
  }
  return undefined;
}

async function waitForClerk(): Promise<LoadedClerk> {
  if (!inBrowser()) {
    throw new ClerkRuntimeError('getToken can only be used in browser environments.', {
      code: 'clerk_runtime_not_browser',
    });
  }

  const clerk = getWindowClerk();
  if (clerk) {
    return clerk;
  }

  const clerkWindow = window as ClerkWindow;

  // Get or create the coordination promise
  if (!clerkWindow.__clerk_internal_ready) {
    let resolve!: (clerk: LoadedClerk) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<LoadedClerk>((res, rej) => {
      resolve = res;
      reject = rej;
    }) as ClerkReadyPromise;
    promise.__resolve = resolve;
    promise.__reject = reject;
    clerkWindow.__clerk_internal_ready = promise;
  }

  const readyPromise = clerkWindow.__clerk_internal_ready;

  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () =>
        reject(
          new ClerkRuntimeError('Timeout waiting for Clerk to load.', {
            code: 'clerk_runtime_load_timeout',
          }),
        ),
      TIMEOUT_MS,
    );
  });

  return Promise.race([readyPromise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Retrieves the current session token, waiting for Clerk to initialize if necessary.
 *
 * This function is safe to call from anywhere in the browser, such as API interceptors,
 * data fetching layers, or vanilla JavaScript code.
 *
 * **Note:** In frameworks with concurrent rendering (e.g., React 18+), a global token read
 * may not correspond to the currently committed UI during transitions. This is a coherence
 * consideration, not an auth safety issue.
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
