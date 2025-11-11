'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useSafeLayoutEffect } from '../../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider, useClerkNextOptions } from '../../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../../types';
import { ClerkJSScript } from '../../utils/clerk-js-script';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { RouterTelemetry } from '../../utils/router-telemetry';
import { detectKeylessEnvDriftAction } from '../keyless-actions';
import { invalidateCacheAction } from '../server-actions';
import { useAwaitablePush } from './useAwaitablePush';
import { useAwaitableReplace } from './useAwaitableReplace';

/**
 * LazyCreateKeylessApplication should only be loaded if the conditions below are met.
 * Note: Using lazy() with Suspense instead of dynamic is not possible as React will throw a hydration error when `ClerkProvider` wraps `<html><body>...`
 */
const LazyCreateKeylessApplication = dynamic(() =>
  import('./keyless-creator-reader.js').then(m => m.KeylessCreatorOrReader),
);

const NextClientClerkProvider = (props: NextClerkProviderProps) => {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true, children } = props;
  const router = useRouter();
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();

  // Call drift detection on mount (client-side)
  useSafeLayoutEffect(() => {
    if (canUseKeyless) {
      void detectKeylessEnvDriftAction();
    }
  }, []);

  // Avoid rendering nested ClerkProviders by checking for the existence of the ClerkNextOptions context provider
  const isNested = Boolean(useClerkNextOptions());
  if (isNested) {
    return props.children;
  }

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = intent => {
      /**
       * We need to invalidate the cache in case the user is navigating to a page that
       * was previously cached using the auth state that was active at the time.
       *
       * We also need to await for the invalidation to happen before we navigate,
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
      return new Promise(resolve => {
        const nextVersion = window?.next?.version || '';

        // On Next.js 15+ calling a server action that returns a 404 error when deployed on Vercel is prohibited, failing with 405 status code.
        // When a user transitions from "signed in" to "signed out", we clear the `__session` cookie, then we call `__unstable__onBeforeSetActive`.
        // If we were to call `invalidateCacheAction` while the user is already signed out (deleted cookie), any page protected by `auth.protect()`
        // will result to the server action returning a 404 error (this happens because server actions inherit the protection rules of the page they are called from).
        // SOLUTION:
        // To mitigate this, since the router cache on version 15 is much less aggressive, we can treat this as a noop and simply resolve the promise.
        // Once `setActive` performs the navigation, `__unstable__onAfterSetActive` will kick in and perform a router.refresh ensuring shared layouts will also update with the correct authentication context.
        if (nextVersion.startsWith('15') && intent === 'sign-out') {
          resolve(); // noop
        } else {
          void invalidateCacheAction().then(() => resolve());
        }
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
    // @ts-expect-error Error because of the stricter types of internal `push`
    routerPush: push,
    // @ts-expect-error Error because of the stricter types of internal `replace`
    routerReplace: replace,
  });

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider {...mergedProps}>
        <RouterTelemetry />
        <ClerkJSScript router='app' />
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
};

export const ClientClerkProvider = (props: NextClerkProviderProps & { disableKeyless?: boolean }) => {
  const { children, disableKeyless = false, ...rest } = props;
  const safePublishableKey = mergeNextClerkPropsWithEnv(rest).publishableKey;

  if (safePublishableKey || !canUseKeyless || disableKeyless) {
    return <NextClientClerkProvider {...rest}>{children}</NextClientClerkProvider>;
  }

  return (
    <LazyCreateKeylessApplication>
      <NextClientClerkProvider {...rest}>{children}</NextClientClerkProvider>
    </LazyCreateKeylessApplication>
  );
};
