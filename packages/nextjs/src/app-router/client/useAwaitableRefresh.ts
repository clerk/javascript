'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';

const getClerkRefreshObject = () => {
  window.__clerk_internal_refresh ??= {};
  return window.__clerk_internal_refresh;
};

/**
 * Returns an "awaitable" `router.refresh()` that waits for React's in-flight transitions to settle
 * before dispatching the refresh.
 *
 * Dispatching a refresh synchronously after an awaitable navigation resolves can permanently wedge
 * the App Router: when the pushed route's Server Component calls `redirect()`, Next follows it with
 * a second navigation dispatched from its redirect boundary, and a refresh dispatched while that
 * follow-up is in flight can end up appended behind a discarded entry in Next's router action
 * queue. It then never runs, and the unresolved state promise it handed to React suspends the
 * router forever.
 *
 * An empty transition started here cannot settle while another transition (such as the redirect
 * follow-up navigation) is still rendering, so waiting for `isPending` to flip back guarantees the
 * refresh is dispatched onto an idle action queue.
 */
export const useAwaitableRefresh = (): (() => Promise<void>) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (typeof window !== 'undefined') {
    getClerkRefreshObject().fun = () => {
      return new Promise<void>(res => {
        // The buffer lives on window so a pending refresh survives ClerkProvider
        // being unmounted and remounted during navigations.
        const refresh = getClerkRefreshObject();
        refresh.promisesBuffer ??= [];
        refresh.promisesBuffer.push(res);
        startTransition(() => {
          // Intentionally empty: used only to observe when in-flight transitions settle.
        });
      });
    };
  }

  const flushPromises = () => {
    const refresh = getClerkRefreshObject();
    refresh.promisesBuffer?.forEach(resolve => resolve());
    refresh.promisesBuffer = [];
  };

  // Resolve any pending promises on unmount so callers awaiting a refresh are never left hanging
  useEffect(() => {
    return flushPromises;
  }, []);

  useEffect(() => {
    if (!isPending && getClerkRefreshObject().promisesBuffer?.length) {
      router.refresh();
      flushPromises();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return useCallback(() => {
    return getClerkRefreshObject().fun?.() ?? Promise.resolve();
  }, []);
};
