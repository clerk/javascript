/**
 * A `RouterAdapter` for the Next.js App Router, meant to be copied into your app. Mosaic has no
 * Next.js entry point and no dependency on Next.js, so this object is the whole integration: pass it
 * from a client component as `<MosaicProvider routing={{ adapter: nextRouterAdapter }}>`.
 *
 * - `usePathname` and `useSearchParams` are Next's own. Mosaic reads the pathname as the address bar
 *   has it, which is what Next returns, and reads a query param's value decoded, which is what
 *   `URLSearchParams` gives.
 * - There is no `useHash`, because Next has no hash hook; Mosaic reads the hash from `window`.
 * - There is no `push` or `replace`. Mosaic writes `window.history` without Next's own history
 *   state, and Next then moves `usePathname` and `useSearchParams` to the new URL without the server
 *   round trip `router.push` would make. Under a `basePath`, path routing needs it in both places Next
 *   leaves it out: `usePathname: () => basePath + usePathname()` here and in the component's `path`.
 * - Only `query` mode calls `useSearchParams`; `path` mode calls `usePathname` and `hash` mode reads
 *   `window` alone. In a statically rendered route, `useSearchParams` opts the tree up to the nearest
 *   `<Suspense>` boundary into client rendering, so a query-mode component on such a page needs one.
 */
import type { RouterAdapter } from '@clerk/mosaic';
import { usePathname, useSearchParams } from 'next/navigation';

export const nextRouterAdapter: RouterAdapter = {
  usePathname,
  useSearchParams,
};
