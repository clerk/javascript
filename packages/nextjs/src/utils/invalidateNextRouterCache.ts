// interface FetchDataOutput {
//   dataHref: string;
//   json: Record<string, any> | null;
//   response: Response;
//   text: string;
//   cacheKey: string;
// }
//
// interface NextDataCache {
//   [asPath: string]: Promise<FetchDataOutput>;
// }

/**
 * A placeholder for the actual next types.
 * The types above are not exported from the next package currently,
 * we only include them here for documentation purposes.
 * see: https://github.com/vercel/next.js/blob/018208fb15c9b969e173684668cea89588f4c536/packages/next/src/shared/lib/router/router.ts#L655
 */
type NextDataCache = any;

/**
 * Only for /pages router
 *
 * Next currently prefetches the page of every visible Link on the page.
 * For every prefetch request, the middleware runs and the response is cached in
 * window.next.router.sdc or window.next.router.sdc
 *
 * Imagine a scenario with a /protected page requiring the user to be signed in using middleware.
 * If we don't invalidate the cache, we end up in the following redirect flow:
 * home -> /protected -> middleware redirects to /sign-in -> perform sign-in
 *            -> try to navigate to /protected but the cached 307 response is used
 *                   -> redirect to /sign-in instead -> withRedirectToHome -> home
 * When the auth state changes and the middleware runs again, the client-side router
 * does not automatically invalidate the cache so the browser follows the cached response
 *
 * This helper invalidates both known caches help prevent the scenario described above.
 */
export const invalidateNextRouterCache = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const invalidate = (cache: NextDataCache) => {
    // deleting the keys without nuking the cache by reassigning the variable to an empty object,
    // in case next holds a reference to it
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
  };

  try {
    invalidate((window as any).next.router.sdc);
    invalidate((window as any).next.router.sbc);
  } catch (e) {
    return;
  }
};
