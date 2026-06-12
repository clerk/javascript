import { QueryClient } from '@tanstack/react-query';

/** Builds a QueryClient with Mosaic's cache defaults — the one place construction lives. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/**
 * The QueryClient to read/mutate against, passed explicitly to each `useQuery`/`useMutation`
 * (react-query's optional `queryClient` arg) so any section renders standalone — no
 * `QueryClientProvider` required in the tree (e.g. a per-component story).
 *
 *  - Browser: one memoized client per tab → shared cache (dedup, invalidation, staleness).
 *  - Server: a fresh client per call, so one request's cache never leaks into another's.
 *
 * That split is what keeps us SSR-**safe**. Going further to SSR-**with-data** (server prefetch →
 * `dehydrate()` → `<HydrationBoundary>`) means moving this behind a per-request provider — kept a
 * one-file swap by routing all construction through here.
 *
 * Caveat: on the server each call returns a distinct client, so cross-component cache sharing
 * within a single SSR render only holds once that provider exists. Fine for the current sections —
 * they suspend on the org signal before any server-side query runs.
 */
export function getMosaicQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  return (browserClient ??= makeQueryClient());
}
