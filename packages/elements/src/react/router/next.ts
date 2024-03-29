import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { NEXT_WINDOW_HISTORY_SUPPORT_VERSION } from '~/internals/constants';

import type { ClerkHostRouter } from './router';

/**
 * Clerk router integration with Next.js's router.
 */
export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The window.history APIs seem to prevent Next.js from triggering a full page re-render, allowing us to
  // preserve internal state between steps.
  const canUseWindowHistoryAPIs =
    typeof window !== 'undefined' && window.next && window.next.version >= NEXT_WINDOW_HISTORY_SUPPORT_VERSION;

  return {
    push: (path: string) => (canUseWindowHistoryAPIs ? window.history.pushState(null, '', path) : router.push(path)),
    replace: (path: string) =>
      canUseWindowHistoryAPIs ? window.history.replaceState(null, '', path) : router.replace(path),
    pathname: () => pathname,
    searchParams: () => searchParams,
  };
};
