'use client';
import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import { InitialStateProvider } from '@clerk/shared/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useSafeLayoutEffect } from '../../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider, useClerkNextOptions } from '../../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../../types';
import { canUseKeyless } from '../../utils/feature-flags';
import { mergeNextClerkPropsWithEnv } from '../../utils/mergeNextClerkPropsWithEnv';
import { RouterTelemetry } from '../../utils/router-telemetry';
import { invalidateCacheAction } from '../server-actions';
import { ClerkScripts } from './ClerkScripts';
import { useAwaitablePush } from './useAwaitablePush';
import { useAwaitableReplace } from './useAwaitableReplace';

/**
 * LazyCreateKeylessApplication should only be loaded if the conditions below are met.
 * Note: Using lazy() with Suspense instead of dynamic is not possible as React will throw a hydration error when `ClerkProvider` wraps `<html><body>...`
 */
const LazyCreateKeylessApplication = dynamic(() =>
  import('./keyless-creator-reader.js').then(m => m.KeylessCreatorOrReader),
);

const NextClientClerkProvider = <TUi extends Ui = Ui>(props: NextClerkProviderProps<TUi>) => {
  const { __internal_invokeMiddlewareOnAuthStateChange = true, __internal_scriptsSlot, children } = props;
  const router = useRouter();
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();

  useSafeLayoutEffect(() => {
    window.__internal_onBeforeSetActive = _intent => {
      /**
       * On Next.js 14, we invalidate the router cache before navigating so the
       * destination page is not served with stale auth state. Without this, a
       * cached 307 redirect can send the user to the wrong page after sign-out.
       * See: https://nextjs.org/docs/app/building-your-application/caching#invalidation-1
       *
       * On Next.js 15+, the router cache is much less aggressive so this is a
       * noop — `__internal_onAfterSetActive` calls `router.refresh()` after
       * navigation which is sufficient.
       */
      return new Promise(resolve => {
        const nextVersion = window?.next?.version || '';

        // On Next.js 15+, the router cache is much less aggressive, so we can skip the server action
        // and rely on `__internal_onAfterSetActive` calling `router.refresh()` to update shared layouts.
        //
        // Skipping the server action avoids two issues:
        // 1. Sign-out: calling a server action after the `__session` cookie is cleared can return a 404/405
        //    on Vercel when the page is protected by `auth.protect()`.
        // 2. Sign-in: `cookies().delete()` in the server action triggers Next.js to re-render the current
        //    page's RSC tree. In Safari, this RSC delivery fails ("TypeError: Load failed"), causing Next.js
        //    to fall back to a hard browser navigation. For flows using one-time tokens (e.g. impersonation
        //    via `__clerk_ticket`), the hard reload re-submits the spent token, resulting in a 400 error.
        if (nextVersion.startsWith('15') || nextVersion.startsWith('16')) {
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

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider {...mergedProps}>
        <RouterTelemetry />
        {__internal_scriptsSlot ?? <ClerkScripts />}
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
