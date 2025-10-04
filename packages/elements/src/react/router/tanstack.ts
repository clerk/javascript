import type { ClerkHostRouter } from '@clerk/types';
import { useRouter } from '@tanstack/react-router';

// Assume you adapt or define this constant similarly; e.g., for TanStack Router v1.0+
import { usePathnameWithoutCatchAll } from '../utils/path-inference/tanstack'; // Assume you create/adapt this util for TanStack (e.g., strip catch-all params like [...slug] from pathname)

/**
 * Clerk Elements router integration with TanStack Router.
 */
export const useTanStackRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = router.location.pathname;
  const searchString = router.location.search; // Raw search string for URLSearchParams
  const inferredBasePath = usePathnameWithoutCatchAll(); // Adapt your custom util for TanStack routing

  // TanStack Router always uses history APIs under the hood for SPA navigation, preserving state without full re-renders.
  // No version check needed unless integrating with very early betas; assume support for v1.x+.
  const canUseHistoryAPIs = typeof window !== 'undefined';

  // Helper to create URLSearchParams from search string (mimics Next.js useSearchParams return type)
  const getSearchParams = () => new URLSearchParams(searchString);

  return {
    mode: 'path',
    name: 'TanStackRouter',
    push: (path: string) => router.navigate({ to: path }),
    replace: (path: string) =>
      canUseHistoryAPIs ? window.history.replaceState(null, '', path) : router.navigate({ to: path, replace: true }),
    shallowPush: (path: string) =>
      // In TanStack Router, all navigations are "shallow" by default (no full reload, preserves state).
      // Use standard push; if you need to avoid re-fetching data, integrate with TanStack Query's stale-while-revalidate or disable refetch.
      canUseHistoryAPIs ? window.history.pushState(null, '', path) : router.navigate({ to: path }),
    pathname: () => pathname,
    searchParams: () => getSearchParams(),
    inferredBasePath: () => inferredBasePath,
  };
};
