'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';

declare global {
  interface Window {
    __clerk_internal_navPromisesBuffer: Array<() => void> | undefined;
    __clerk_internal_navFun: (to: string) => Promise<void>;
  }
}

/**
 * Creates an "awaitable" navigation function that will do its best effort to wait for Next.js to finish its route transition.
 * This is accomplished by wrapping the call to `router.push` in `startTransition()`, which should rely on React to coordinate the pending state. We key off of
 * `isPending` to flush the stored promises and ensure the navigates "resolve".
 */
export const useAwaitableNavigate = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (typeof window !== 'undefined') {
    window.__clerk_internal_navFun = to => {
      return new Promise<void>(res => {
        if (!window.__clerk_internal_navPromisesBuffer) {
          // We need to use window to store the reference to the buffer,
          // as ClerkProvider might be unmounted and remounted during navigations
          // If we use a ref, it will be reset when ClerkProvider is unmounted
          window.__clerk_internal_navPromisesBuffer = [];
        }
        window.__clerk_internal_navPromisesBuffer.push(res);
        startTransition(() => {
          push(to);
        });
      });
    };
  }

  const flushPromises = () => {
    window.__clerk_internal_navPromisesBuffer?.forEach(resolve => resolve());
    window.__clerk_internal_navPromisesBuffer = [];
  };

  // Flush any pending promises on mount/unmount
  useEffect(() => {
    flushPromises();
    return flushPromises;
  }, []);

  // Handle flushing the promise buffer when a navigation happens
  useEffect(() => {
    if (!isPending) {
      flushPromises();
    }
  }, [pathname, isPending]);

  return useCallback((to: string) => {
    return window.__clerk_internal_navFun(to);
  }, []);
};
