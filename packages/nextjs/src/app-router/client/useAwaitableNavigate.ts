'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';

type NavigateFunction = ReturnType<typeof useRouter>['push'];

/**
 * Creates an "awaitable" navigation function that will do its best effort to wait for Next.js to finish its route transition.
 *
 * This is accomplished by wrapping the call to `router.push` in `startTransition()`, which should rely on React to coordinate the pending state. We key off of
 * `isPending` to flush the stored promises and ensure the navigates "resolve".
 */
export const useAwaitableNavigate = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();
  const clerkNavRef = useRef<(...args: Parameters<NavigateFunction>) => Promise<void>>();
  const clerkNavPromiseBuffer = useRef<(() => void)[]>([]);

  // Set the navigation function reference only once
  if (!clerkNavRef.current) {
    clerkNavRef.current = (to, opts) => {
      return new Promise<void>(res => {
        clerkNavPromiseBuffer.current.push(res);
        startTransition(() => {
          push(to, opts);
        });
      });
    };
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
