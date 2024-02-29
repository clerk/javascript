'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useTransition } from 'react';

import { ClerkNextOptionsProvider } from '../../client-boundary/NextOptionsContext';
import { useSafeLayoutEffect } from '../../client-boundary/useSafeLayoutEffect';
import type { NextClerkProviderProps } from '../../types';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { useAwaitableNavigate } from './useAwaitableNavigate';

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
  const navigate = useAwaitableNavigate();
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
          router.refresh();
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
    routerPush: navigate,
    routerReplace: to => router.replace(to),
  });

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider {...mergedProps}>{children}</ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
};
