'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';

import type { NextClerkProviderProps } from '../../types';

declare global {
  interface Window {
    __clerk_internal_navPromisesBuffer: Array<() => void> | undefined;
    __clerk_internal_navFun: NonNullable<NextClerkProviderProps['routerReplace']>;
  }
}

/**
 * Creates an "awaitable" navigation function that will do its best effort to wait for Next.js to finish its route transition.
 * This is accomplished by wrapping the call to `router.replace` in `startTransition()`, which should rely on React to coordinate the pending state. We key off of
 * `isPending` to flush the stored promises and ensure the navigates "resolve".
 */
export const useAwaitableReplace = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (typeof window !== 'undefined') {
    window.__clerk_internal_navFun = (to, opts) => {
      return new Promise<void>(res => {
        if (!window.__clerk_internal_navPromisesBuffer) {
          // We need to use window to store the reference to the buffer,
          // as ClerkProvider might be unmounted and remounted during navigations
          // If we use a ref, it will be reset when ClerkProvider is unmounted
          window.__clerk_internal_navPromisesBuffer = [];
        }
        window.__clerk_internal_navPromisesBuffer.push(res);
        startTransition(() => {
          // If the navigation is internal, we should use the history API to navigate
          // as this is the way to perform a shallow navigation in Next.js App Router
          // without unmounting/remounting the page or fetching data from the server.
          if (opts?.__internal_metadata?.navigationType === 'internal') {
            // In 14.1.0, useSearchParams becomes reactive to shallow updates,
            // but only if passing `null` as the history state.
            // Older versions need to maintain the history state for push to work,
            // without affecting how the Next router works.
            const state = ((window as any).next?.version ?? '') < '14.1.0' ? history.state : null;
            window.history.replaceState(state, '', to);
          } else {
            // If the navigation is external (usually when navigating away from the component but still within the app),
            // we should use the Next.js router to navigate as it will handle updating the URL and also
            // fetching the new page if necessary.
            router.replace(to);
          }
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
