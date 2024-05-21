import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { NEXT_WINDOW_HISTORY_SUPPORT_VERSION } from '~/internals/constants';

import type { ClerkHostRouter } from './router';

/**
 * Clerk router integration with Next.js's router.
 */
export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- The order doesn't differ between renders as we're checking the execution environment.
  const searchParams = typeof window === 'undefined' ? new URLSearchParams() : useSearchParams();

  // The window.history APIs seem to prevent Next.js from triggering a full page re-render, allowing us to
  // preserve internal state between steps.
  const canUseWindowHistoryAPIs =
    typeof window !== 'undefined' && window.next && window.next.version >= NEXT_WINDOW_HISTORY_SUPPORT_VERSION;

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) =>
      canUseWindowHistoryAPIs ? window.history.replaceState(null, '', path) : router.replace(path),
    shallowPush(path: string) {
      canUseWindowHistoryAPIs ? window.history.pushState(null, '', path) : router.push(path, {});
    },
    pathname: () => pathname,
    searchParams: () => searchParams,
  };
};
