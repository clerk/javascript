import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
// Override Clerk React error thrower to show that errors come from @clerk/nextjs
import { setClerkJsLoadingErrorPackageName, setErrorThrowerOptions } from '@clerk/clerk-react/internal';
import type { ClerkHostRouter } from '@clerk/shared/router';
import { useRouter } from 'next/router';
import React from 'react';

import { useSafeLayoutEffect } from '../client-boundary/hooks/useSafeLayoutEffect';
import { ClerkNextOptionsProvider } from '../client-boundary/NextOptionsContext';
import type { NextClerkProviderProps } from '../types';
import { ClerkJSScript } from '../utils/clerk-js-script';
import { invalidateNextRouterCache } from '../utils/invalidateNextRouterCache';
import { mergeNextClerkPropsWithEnv } from '../utils/mergeNextClerkPropsWithEnv';
import { removeBasePath } from '../utils/removeBasePath';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);

// The version that Next added support for the window.history.pushState and replaceState APIs.
// ref: https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate
const NEXT_WINDOW_HISTORY_SUPPORT_VERSION = '14.1.0';

/**
 * Clerk router integration with Next.js's router.
 */
const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();

  // The window.history APIs seem to prevent Next.js from triggering a full page re-render, allowing us to
  // preserve internal state between steps.
  const canUseWindowHistoryAPIs =
    typeof window !== 'undefined' && window.next && window.next.version >= NEXT_WINDOW_HISTORY_SUPPORT_VERSION;

  return {
    mode: 'path',
    name: 'NextRouter',
    push: (path: string) => router.push(path),
    replace: (path: string) =>
      canUseWindowHistoryAPIs ? window.history.replaceState(null, '', path) : router.replace(path),
    shallowPush(path: string) {
      canUseWindowHistoryAPIs ? window.history.pushState(null, '', path) : router.push(path, {});
    },
    pathname: () => window.location.pathname,
    searchParams: () => new URLSearchParams(window.location.search),
  };
};

export function ClerkProvider({ children, ...props }: NextClerkProviderProps): JSX.Element {
  const { __unstable_invokeMiddlewareOnAuthStateChange = true } = props;
  const { push, replace } = useRouter();
  const clerkRouter = useNextRouter();
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
  }, []);

  useSafeLayoutEffect(() => {
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.\
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        void push(window.location.href);
      }
    };
  }, []);

  const navigate = (to: string) => push(removeBasePath(to));
  const replaceNavigate = (to: string) => replace(removeBasePath(to));
  const mergedProps = mergeNextClerkPropsWithEnv({
    ...props,
    __experimental_router: clerkRouter,
    routerPush: navigate,
    routerReplace: replaceNavigate,
  });
  // ClerkProvider automatically injects __clerk_ssr_state
  // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
  // @ts-expect-error initialState is hidden from the types as it's a private prop
  const initialState = props.authServerSideProps?.__clerk_ssr_state || props.__clerk_ssr_state;

  return (
    <ClerkNextOptionsProvider options={mergedProps}>
      <ReactClerkProvider
        {...mergedProps}
        initialState={initialState}
      >
        <ClerkJSScript router='pages' />
        {children}
      </ReactClerkProvider>
    </ClerkNextOptionsProvider>
  );
}
