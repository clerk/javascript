import type { ClerkHostRouter } from '@clerk/shared/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { NEXT_WINDOW_HISTORY_SUPPORT_VERSION } from '~/internals/constants';

import { usePathnameWithoutCatchAll } from '../utils/path-inference/next';

/**
 * Clerk Elements router integration with Next.js's router.
 */
export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inferredBasePath = usePathnameWithoutCatchAll();

  // The window.history APIs seem to prevent Next.js from triggering a full page re-render, allowing us to
  // preserve internal state between steps.
  const canUseWindowHistoryAPIs =
    typeof window !== 'undefined' && window.next && window.next.version >= NEXT_WINDOW_HISTORY_SUPPORT_VERSION;

  return {
    mode: 'path',
    name: 'NextRouter',
    push: (path: string) => router.push(path),
    replace: (path: string) =>
      canUseWindowHistoryAPIs ? window.history.replaceState(null, '', path) : router.replace(path),
    shallowPush: (path: string) =>
      canUseWindowHistoryAPIs ? window.history.pushState(null, '', path) : router.push(path, {}),
    pathname: () => pathname,
    searchParams: () => searchParams,
    inferredBasePath: () => inferredBasePath,
  };
};
