import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';

import type { NextClerkProviderProps } from '../../types';

declare global {
  interface Window {
    __clerk_internal_navigations: Record<
      string,
      {
        fun: NonNullable<NextClerkProviderProps['routerPush'] | NextClerkProviderProps['routerReplace']>;
        promisesBuffer: Array<() => void> | undefined;
      }
    >;
  }
}

const getClerkNavigationObject = (name: string) => {
  window.__clerk_internal_navigations ??= {};
  // @ts-ignore
  window.__clerk_internal_navigations[name] ??= {};
  return window.__clerk_internal_navigations[name];
};

export const useInternalNavFun = (props: {
  windowNav: typeof window.history.pushState | typeof window.history.replaceState | undefined;
  routerNav: AppRouterInstance['push'] | AppRouterInstance['replace'];
  name: string;
}) => {
  const { windowNav, routerNav, name } = props;
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (windowNav) {
    getClerkNavigationObject(name).fun = (to, opts) => {
      return new Promise<void>(res => {
        // We need to use window to store the reference to the buffer,
        // as ClerkProvider might be unmounted and remounted during navigations
        // If we use a ref, it will be reset when ClerkProvider is unmounted
        getClerkNavigationObject(name).promisesBuffer ??= [];
        getClerkNavigationObject(name).promisesBuffer?.push(res);
        startTransition(() => {
          // If the navigation is internal, we should use the history API to navigate
          // as this is the way to perform a shallow navigation in Next.js App Router
          // without unmounting/remounting the page or fetching data from the server.
          if (opts?.__internal_metadata?.navigationType === 'internal') {
            // In 14.1.0, useSearchParams becomes reactive to shallow updates,
            // but only if passing `null` as the history state.
            // Older versions need to maintain the history state for push/replace to work,
            // without affecting how the Next router works.
            const state = ((window as any).next?.version ?? '') < '14.1.0' ? history.state : null;
            windowNav(state, '', to);
          } else {
            // If the navigation is external (usually when navigating away from the component but still within the app),
            // we should use the Next.js router to navigate as it will handle updating the URL and also
            // fetching the new page if necessary.
            routerNav(to);
          }
        });
      });
    };
  }

  const flushPromises = () => {
    getClerkNavigationObject(name).promisesBuffer?.forEach(resolve => resolve());
    getClerkNavigationObject(name).promisesBuffer = [];
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
    return getClerkNavigationObject(name).fun(to);
    // We are not expecting name to change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
