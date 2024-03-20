import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { NEXT_ROUTING_CHANGE_VERSION } from '~/internals/constants';

import type { ClerkHostRouter } from './router';

/**
 * Framework specific router integrations
 */

export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shallow = typeof window === 'undefined' || !window.next || window.next.version < NEXT_ROUTING_CHANGE_VERSION;

  return {
    push: (path: string) => (shallow ? router.push(path) : window.history.pushState(null, '', path)),
    replace: (path: string) => (shallow ? router.replace(path) : window.history.replaceState(null, '', path)),
    pathname: () => pathname,
    searchParams: () => searchParams,
  };
};
