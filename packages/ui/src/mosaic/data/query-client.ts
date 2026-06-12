import { QueryClient } from '@tanstack/react-query';

/**
 * The single QueryClient backing every Mosaic server-collection read/mutation. One instance for
 * the whole module so all components share one cache (dedup, invalidation, staleness).
 *
 * Passed explicitly to each `useQuery`/`useMutation` (react-query's optional `queryClient` arg)
 * instead of via a `QueryClientProvider`, so any section renders standalone — no provider required
 * in the tree. Self-contained: no external client is imported.
 */
export const mosaicQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
