'use client';

import { useRouter } from 'next/navigation';

import { useInternalNavFun } from './useInternalNavFun';

/**
 * Creates an "awaitable" navigation function that will do its best effort to wait for Next.js to finish its route transition.
 * This is accomplished by wrapping the call to `router.push` in `startTransition()`, which should rely on React to coordinate the pending state. We key off of
 * `isPending` to flush the stored promises and ensure the navigates "resolve".
 */
export const useAwaitablePush = () => {
  const router = useRouter();

  return useInternalNavFun({
    windowNav: typeof window !== 'undefined' ? window.history.pushState.bind(window.history) : undefined,
    routerNav: router.push.bind(router),
    name: 'push',
  });
};
