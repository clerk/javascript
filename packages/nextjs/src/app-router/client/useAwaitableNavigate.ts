'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';

import type { NextClerkProviderProps } from '../../types';

/**
 * Creates an "awaitable" navigation function that will do its best effort to wait for Next.js to finish its route transition.
 *
 * This is accomplished by wrapping the call to `router.push` in `startTransition()`, which should rely on React to coordinate the pending state. We key off of
 * `isPending` to flush the stored promises and ensure the navigates "resolve".
 */
export const useAwaitableNavigate = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const clerkNavRef = useRef<NonNullable<NextClerkProviderProps['routerPush']>>();
  const clerkNavPromiseBuffer = useRef<(() => void)[]>([]);

  // Set the navigation function reference only once
  if (!clerkNavRef.current) {
    clerkNavRef.current = ((to, opts) => {
      return new Promise<void>(res => {
        clerkNavPromiseBuffer.current.push(res);
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
            window.history.pushState(state, '', to);
          } else {
            // If the navigation is external (usually when navigating away from the component but still within the app),
            // we should use the Next.js router to navigate as it will handle updating the URL and also
            // fetching the new page if necessary.
            router.push(to);
          }
        });
      });
    }) as NextClerkProviderProps['routerPush'];
  }

  // Handle flushing the promise buffer when pending is false. If pending is false and there are promises in the buffer we should be able to safely flush them.
  useEffect(() => {
    if (isPending) {
      return;
    }

    if (clerkNavPromiseBuffer?.current?.length) {
      clerkNavPromiseBuffer.current.forEach(resolve => resolve());
    }

    clerkNavPromiseBuffer.current = [];
  }, [isPending]);

  return clerkNavRef.current;
};
