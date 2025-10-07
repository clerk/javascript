import type { ClerkHostRouter } from '@clerk/types';
import { useRouter } from '@tanstack/react-router';

import { usePathnameWithoutCatchAll } from '../utils/path-inference/tanstack';

/**
 * Clerk Elements router integration hook for TanStack Router.
 *
 * Provides a standardized router interface (`ClerkHostRouter`) that Clerk Elements
 * can use to navigate and read URL state within a TanStack Router application.
 *
 * @returns A `ClerkHostRouter` object with navigation methods (`push`, `replace`, `shallowPush`),
 * URL state accessors (`pathname`, `searchParams`), and path inference (`inferredBasePath`).
 *
 * @example
 * ```tsx
 * import { useTanStackRouter } from '@clerk/elements/tanstack';
 *
 * function MyComponent() {
 *   const router = useTanStackRouter();
 *   // Clerk Elements will use this router for navigation
 * }
 * ```
 *
 * @remarks
 * - Requires TanStack Router v1.x+ to be installed and configured in your application.
 * - The hook must be called within a TanStack Router context (inside a `<RouterProvider>`).
 */
export const useTanStackRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = router.location.pathname;
  const searchString = router.location.search;
  const inferredBasePath = usePathnameWithoutCatchAll(); //
  const getSearchParams = () => new URLSearchParams(searchString);

  return {
    mode: 'path',
    name: 'TanStackRouter',
    push: (path: string) => router.navigate({ to: path }),
    replace: (path: string) => router.navigate({ to: path, replace: true }),
    shallowPush: (path: string) =>
      // In TanStack Router, all navigations are already shallow by default.
      router.navigate({ to: path }),
    pathname: () => pathname,
    searchParams: () => getSearchParams(),
    inferredBasePath: () => inferredBasePath,
  };
};
