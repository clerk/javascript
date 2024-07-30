'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useTransition } from 'react';

import { useSafeLayoutEffect } from '../../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider } from '../../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../../types';
import { ClerkJSScript } from '../../utils/clerk-js-script';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { invalidateCacheAction } from '../server-actions';
import { useAwaitablePush } from './useAwaitablePush';
import { useAwaitableReplace } from './useAwaitableReplace';

declare global {
  export interface Window {
    __clerk_nav_await: Array<(value: void) => void>;
    __clerk_nav: (to: string) => Promise<void>;
    __clerk_internal_invalidateCachePromise: () => void | undefined;
  }
}

export const ClientClerkProvider = (props: NextClerkProviderProps) => {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true, children } = props;
  const router = useRouter();
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending) {
      window.__clerk_internal_invalidateCachePromise?.();
    }
  }, [isPending]);

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = () => {
      /**
       * We need to invalidate the cache in case the user is navigating to a page that
       * was previously cached using the auth state that was active at the time.
       *
       *  We also need to await for the invalidation to happen before we navigate,
       * otherwise the navigation will use the cached page.
       *
       * For example, if we did not invalidate the flow, the following scenario would be broken:
       * - The middleware is configured in such a way that it redirects you back to the same page if a certain condition is true (eg, you need to pick an org)
       * - The user has a <Link href=/> component in the page
       * - The UB is mounted with afterSignOutUrl=/
       * - The user clicks the Link. A nav to / happens, a 307 to the current page is returned so a navigation does not take place. The / navigation is now cached as a 307 to the current page
       * - The user clicks sign out
       * - We call router.refresh()
       * - We navigate to / but its cached and instead, we 'redirect' to the current page
       *
       *  For more information on cache invalidation, see:
       * https://nextjs.org/docs/app/building-your-application/caching#invalidation-1
       */
      return new Promise(res => {
        window.__clerk_internal_invalidateCachePromise = res;
        startTransition(() => {
          //@ts-expect-error next exists on window
          if (window.next?.version && typeof window.next.version === 'string' && window.next.version.startsWith('13')) {
            router.refresh();
          } else {
            void invalidateCacheAction();
          }
        });
      });
    };

    window.__unstable__onAfterSetActive = () => {
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        return router.refresh();
      }
    };
  }, []);

  const mergedProps = mergeNextClerkPropsWithEnv({
    ...props,
    routerPush: push,
    routerReplace: replace,
  });

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider {...mergedProps}>
        <ClerkJSScript router='app' />
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
};
