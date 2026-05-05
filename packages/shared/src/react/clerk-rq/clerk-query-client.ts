import { QueryClient } from '@tanstack/query-core';

/**
 * The QueryClient backing every clerk-rq hook. Owned by `@clerk/shared` so the
 * `QueryObserver` that observes it and the `Query` objects inside it always
 * resolve to the same `@tanstack/query-core` (no cross-bundle drift between
 * the consumer-side `@clerk/shared` and the production CDN `clerk-js` bundle).
 *
 * Lazily instantiated on the client only. Server-side renders return
 * `undefined` so per-request renders never share a cache across requests.
 */
let clerkQueryClient: QueryClient | undefined;
let initialized = false;

export function getClerkQueryClient(): QueryClient | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  if (!initialized) {
    clerkQueryClient = new QueryClient();
    initialized = true;
  }
  return clerkQueryClient;
}

/**
 * Test-only: install a custom client (for deterministic defaults like
 * `staleTime: Infinity`) or pass `undefined` to simulate the "no client"
 * state without triggering lazy creation on subsequent reads.
 */
export function __setClerkQueryClientForTest(client: QueryClient | undefined): void {
  clerkQueryClient = client;
  initialized = true;
}

/**
 * Test-only: build and install a fresh `QueryClient` with deterministic
 * defaults (no retries, infinite stale time, no refetching). Returns the
 * client so the spec can read/write its cache directly.
 *
 * Avoids forcing every test consumer to depend on `@tanstack/query-core`.
 */
export function __createClerkTestQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });
  __setClerkQueryClientForTest(client);
  return client;
}

/**
 * Test-only: clear both the override and the initialization flag so the
 * next read lazy-creates a fresh client.
 */
export function __resetClerkQueryClientForTest(): void {
  clerkQueryClient = undefined;
  initialized = false;
}
