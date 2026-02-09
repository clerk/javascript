'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import { InitialStateProvider } from '@clerk/shared/react';
import type { BrowserClerkConstructor } from '@clerk/shared/types';
import type { ClerkUIConstructor } from '@clerk/shared/ui';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useSafeLayoutEffect } from '../../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider, useClerkNextOptions } from '../../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../../types';
import { ClerkScripts } from '../../utils/clerk-script';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { RouterTelemetry } from '../../utils/router-telemetry';
import { invalidateCacheAction } from '../server-actions';
import { useAwaitablePush } from './useAwaitablePush';
import { useAwaitableReplace } from './useAwaitableReplace';

// Cached promise for resolving ClerkUI constructor via dynamic import.
// In RSC, the ui prop from @clerk/ui is serialized without the ClerkUI constructor
// (not serializable). This re-imports it on the client when needed.
let _resolvedClerkUI: Promise<ClerkUIConstructor> | undefined;
let _resolvedClerkJS: Promise<BrowserClerkConstructor> | undefined;

/**
 * LazyCreateKeylessApplication should only be loaded if the conditions below are met.
 * Note: Using lazy() with Suspense instead of dynamic is not possible as React will throw a hydration error when `ClerkProvider` wraps `<html><body>...`
 */
const LazyCreateKeylessApplication = dynamic(() =>
  import('./keyless-creator-reader.js').then(m => m.KeylessCreatorOrReader),
);

const NextClientClerkProvider = <TUi extends Ui = Ui>(props: NextClerkProviderProps<TUi>) => {
  const { __internal_invokeMiddlewareOnAuthStateChange = true, children } = props;
  const router = useRouter();
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();

  useSafeLayoutEffect(() => {
    window.__internal_onBeforeSetActive = intent => {
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
        // When a user transitions from "signed in" to "signed out", we clear the `__session` cookie, then we call `__internal_onBeforeSetActive`.
        // If we were to call `invalidateCacheAction` while the user is already signed out (deleted cookie), any page protected by `auth.protect()`
        // will result to the server action returning a 404 error (this happens because server actions inherit the protection rules of the page they are called from).
        // SOLUTION:
        // To mitigate this, since the router cache on version 15+ is much less aggressive, we can treat this as a noop and simply resolve the promise.
        // Once `setActive` performs the navigation, `__internal_onAfterSetActive` will kick in and perform a router.refresh ensuring shared layouts will also update with the correct authentication context.
        if ((nextVersion.startsWith('15') || nextVersion.startsWith('16')) && intent === 'sign-out') {
          resolve(); // noop
        } else {
          void invalidateCacheAction().then(() => resolve());
        }
      });
    };

    window.__internal_onAfterSetActive = () => {
      if (__internal_invokeMiddlewareOnAuthStateChange) {
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

  // Resolve ClerkUI for RSC: when the ui prop is serialized through React Server Components,
  // the ClerkUI constructor is stripped (not serializable). Re-import it on the client.
  const uiProp = mergedProps.ui as { __brand?: string; ClerkUI?: unknown } | undefined;
  if (uiProp?.__brand && !uiProp?.ClerkUI) {
    // webpackIgnore prevents the bundler from statically resolving @clerk/ui/entry at build time,
    // since @clerk/ui is an optional dependency that may not be installed.
    // @ts-expect-error - @clerk/ui/entry is resolved by the user's Next.js bundler at runtime, not at package build time
    // eslint-disable-next-line import/no-unresolved
    _resolvedClerkUI ??= import(/* webpackIgnore: true */ '@clerk/ui/entry').then(
      (m: { ClerkUI: ClerkUIConstructor }) => m.ClerkUI,
    );
    mergedProps.ui = { ...mergedProps.ui, ClerkUI: _resolvedClerkUI };
  }

  // Resolve ClerkJS for RSC: when the js prop is serialized through React Server Components,
  // the ClerkJS constructor is stripped (not serializable). Re-import it on the client.
  const jsProp = mergedProps.js as { __brand?: string; ClerkJS?: unknown } | undefined;
  if (jsProp?.__brand && !jsProp?.ClerkJS) {
    // webpackIgnore prevents the bundler from statically resolving @clerk/clerk-js/entry at build time,
    // since this import is only needed when the js prop is passed.
    // @ts-expect-error - @clerk/clerk-js/entry is resolved by the user's Next.js bundler at runtime
    // eslint-disable-next-line import/no-unresolved
    _resolvedClerkJS ??= import(/* webpackIgnore: true */ '@clerk/clerk-js/entry').then(
      (m: { ClerkJS: BrowserClerkConstructor }) => m.ClerkJS,
    );
    mergedProps.js = { ...mergedProps.js, ClerkJS: _resolvedClerkJS };
  }

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider {...mergedProps}>
        <RouterTelemetry />
        <ClerkScripts router='app' />
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
};

export const ClientClerkProvider = <TUi extends Ui = Ui>(
  props: NextClerkProviderProps<TUi> & { disableKeyless?: boolean },
) => {
  const { children, disableKeyless = false, ...rest } = props;
  const safePublishableKey = mergeNextClerkPropsWithEnv(rest).publishableKey;

  // Avoid rendering nested ClerkProviders by checking for the existence of the ClerkNextOptions context provider
  const isNested = Boolean(useClerkNextOptions());
  if (isNested) {
    if (rest.initialState) {
      // If using <ClerkProvider dynamic> inside a <ClerkProvider>, we do want the initial state to be available for this subtree
      return <InitialStateProvider initialState={rest.initialState}>{children}</InitialStateProvider>;
    }
    return children;
  }

  if (safePublishableKey || !canUseKeyless || disableKeyless) {
    return <NextClientClerkProvider {...rest}>{children}</NextClientClerkProvider>;
  }

  return (
    <LazyCreateKeylessApplication>
      <NextClientClerkProvider {...rest}>{children}</NextClientClerkProvider>
    </LazyCreateKeylessApplication>
  );
};
