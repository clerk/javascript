'use server';
import { cookies } from 'next/headers';

/**
 * This function is used as a workaround to clear the client-side routing cache
 * AppRouter uses before we fire an auth state update.
 * We need to invalidate the cache in case the user is navigating to a page that
 * was previously cached using the auth state that was active at the time.
 *
 * For example, if we did not invalidate the flow, the following scenario would be broken:
 * - The middleware is configured in such a way that it redirects you back to the same page if a certain condition is true (eg, you need to pick an org)
 * - The user has a <Link href=/> component in the page
 * - The UB is mounted with afterSignOutUrl=/
 * - The user clicks the Link. A nav to / happens, a 307 to the current page is returned so a navigation does not take place. The / navigation is now cached as a 307 to the current page
 * - The user clicks sign out
 * - We call router.refresh()
 * - We navigate to / but its cached and instead, we 'redirect' to the current page
 *
 *  For more information on cache invalidation, see:
 * https://nextjs.org/docs/app/building-your-application/caching#invalidation-1
 */
export const invalidateCacheAction = async () => {
  cookies().delete(`__clerk_random_cookie_${Date.now()}`);
  return Promise.resolve();
};
