'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';

const getClerkRefreshObject = () => {
  window.__clerk_internal_refresh ??= {};
  return window.__clerk_internal_refresh;
};

/**
 * Returns a fire-and-forget `router.refresh()` that waits for React's in-flight transitions to
 * settle before dispatching the refresh.
 *
 * Dispatching a refresh synchronously after an awaitable navigation resolves can permanently wedge
 * the App Router: when the pushed route's Server Component calls `redirect()`, Next follows it with
 * a second navigation dispatched from its redirect boundary, and a refresh dispatched while that
 * follow-up is in flight can end up appended behind a discarded entry in Next's router action
 * queue (fixed upstream in next@16.3.0, broken in 15.5.1 through 16.2.x). It then never runs, and
 * the unresolved state promise it handed to React suspends the router forever.
 *
 * An empty transition started here cannot settle while another transition (such as the redirect
 * follow-up navigation) is still rendering, so waiting for `isPending` to flip back guarantees the
 * refresh is dispatched onto an idle action queue.
 *
 * The returned function is intentionally not awaitable: a long-running app transition (e.g. a
 * suspended `startTransition` held open by userland code) delays the refresh, and callers such as
 * `setActive` must not block on it. The pending request lives on `window` so it survives
 * `ClerkProvider` remounts; the next mounted instance dispatches it.
 */
export const useDeferredRefresh = (): (() => void) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (typeof window !== 'undefined') {
    getClerkRefreshObject().fun = () => {
      getClerkRefreshObject().pending = true;
      startTransition(() => {
        // Intentionally empty: used only to observe when in-flight transitions settle.
      });
    };
  }

  useEffect(() => {
    if (!isPending && getClerkRefreshObject().pending) {
      getClerkRefreshObject().pending = false;
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return useCallback(() => {
    getClerkRefreshObject().fun?.();
  }, []);
};
