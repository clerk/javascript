import type { QueryClient } from '@tanstack/query-core';

export const CLERK_QUERY_CLIENT_TAG = 'clerk-rq-client' as const;
export const CLERK_QUERY_CLIENT_VERSION = 1 as const;

type ForwardedQueryClientMethods =
  | 'defaultQueryOptions'
  | 'invalidateQueries'
  | 'removeQueries'
  | 'getQueryData'
  | 'setQueryData'
  | 'clear';

export type ClerkQueryClient = {
  readonly version: typeof CLERK_QUERY_CLIENT_VERSION;
  readonly asQueryClient: () => QueryClient;
} & {
  [K in ForwardedQueryClientMethods]: QueryClient[K];
};

export type ClerkQueryClientCarrier = {
  readonly __tag: typeof CLERK_QUERY_CLIENT_TAG;
  readonly client: ClerkQueryClient;
};

/**
 * Ensures QueryClient instance methods keep their original `this` binding
 * when re-exposed through the Clerk facade.
 */
function bindMethod<K extends ForwardedQueryClientMethods>(client: QueryClient, method: K): ClerkQueryClient[K] {
  return client[method].bind(client) as ClerkQueryClient[K];
}

/**
 * Wraps a TanStack QueryClient instance in a narrow, Clerk-owned facade so we
 * can control the surface area consumed by downstream packages.
 */
export function createClerkQueryClientCarrier(queryClient: QueryClient): ClerkQueryClientCarrier {
  const facade: ClerkQueryClient = {
    version: CLERK_QUERY_CLIENT_VERSION,
    defaultQueryOptions: bindMethod(queryClient, 'defaultQueryOptions'),
    invalidateQueries: bindMethod(queryClient, 'invalidateQueries'),
    removeQueries: bindMethod(queryClient, 'removeQueries'),
    getQueryData: bindMethod(queryClient, 'getQueryData'),
    setQueryData: bindMethod(queryClient, 'setQueryData'),
    clear: bindMethod(queryClient, 'clear'),
    asQueryClient: () => queryClient,
  };

  return {
    __tag: CLERK_QUERY_CLIENT_TAG,
    client: facade,
  };
}

/**
 * Type guard that verifies whether an arbitrary value conforms to the Clerk
 * query client carrier contract emitted by clerk-js.
 */
export function isClerkQueryClientCarrier(value: unknown): value is ClerkQueryClientCarrier {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ClerkQueryClientCarrier>;

  return (
    candidate.__tag === CLERK_QUERY_CLIENT_TAG && typeof candidate.client === 'object' && candidate.client !== null
  );
}
