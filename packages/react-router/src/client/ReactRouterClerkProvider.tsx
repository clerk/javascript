import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import React from 'react';

import { assertValidClerkState, inSpaMode, warnForSsr } from '../utils';
import { ClerkReactRouterOptionsProvider } from './ReactRouterOptionsContext';
import type { ClerkState, ReactRouterClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

/**
 * Remix hydration errors should not stop Clerk navigation from working, as the components mount only after
 * hydration is done (in the case of a hydration error, the components will simply mount after client-side hydration)
 * In the case of a hydration error, the first `navigate` function we get from the `useNavigate` hook will not work
 * because the RemixClerkProvider (which is part of the host app) will unmount before the following useEffect within `navigate` fires:
 * https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx#L175
 * so isomorphicClerk will initialize with a `navigate` function that will never have `activeRef.current` set to true.
 * This variable is just an object ref/cache outside the React rendering cycle that holds a reference to the
 * latest `navigate` function. After a hydration error occurs, RemixClerkProvider will *remount* and this variable
 * will finally get a `navigate` function that has a `activeRef.current` to true so navigation will function as it should.
 */
const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

/**
 * Internal type that includes the initial state prop that is passed to the ClerkProvider
 * during SSR.
 * This is a value that we pass automatically so it does not need to pollute the public API.
 */
type ClerkProviderPropsWithState = ReactRouterClerkProviderProps & {
  clerkState?: ClerkState;
};

export function ClerkProvider({ children, ...rest }: ClerkProviderPropsWithState): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  const isSpaMode = inSpaMode();

  React.useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);

  const { clerkState, ...restProps } = rest;
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  if (!isSpaMode) {
    assertValidClerkState(clerkState);
  }

  const {
    __clerk_ssr_state,
    __publishableKey,
    __proxyUrl,
    __domain,
    __isSatellite,
    __clerk_debug,
    __signInUrl,
    __signUpUrl,
    __afterSignInUrl,
    __afterSignUpUrl,
    __signInForceRedirectUrl,
    __signUpForceRedirectUrl,
    __signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl,
    __clerkJSUrl,
    __clerkJSVersion,
    __telemetryDisabled,
    __telemetryDebug,
  } = clerkState?.__internal_clerk_state || {};

  React.useEffect(() => {
    if (!isSpaMode) {
      warnForSsr(clerkState);
    }
  }, []);

  React.useEffect(() => {
    (window as any).__clerk_debug = __clerk_debug;
  }, []);

  const mergedProps = {
    publishableKey: __publishableKey as any,
    proxyUrl: __proxyUrl as any,
    domain: __domain as any,
    isSatellite: __isSatellite,
    signInUrl: __signInUrl,
    signUpUrl: __signUpUrl,
    afterSignInUrl: __afterSignInUrl,
    afterSignUpUrl: __afterSignUpUrl,
    signInForceRedirectUrl: __signInForceRedirectUrl,
    signUpForceRedirectUrl: __signUpForceRedirectUrl,
    signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
    clerkJSUrl: __clerkJSUrl,
    clerkJSVersion: __clerkJSVersion,
    telemetry: {
      disabled: __telemetryDisabled,
      debug: __telemetryDebug,
    },
  };

  return (
    <ClerkReactRouterOptionsProvider options={mergedProps}>
      <ReactClerkProvider
        routerPush={(to: string) => awaitableNavigateRef.current?.(to)}
        routerReplace={(to: string) => awaitableNavigateRef.current?.(to, { replace: true })}
        initialState={__clerk_ssr_state}
        sdkMetadata={SDK_METADATA}
        {...mergedProps}
        {...restProps}
      >
        {children}
      </ReactClerkProvider>
    </ClerkReactRouterOptionsProvider>
  );
}
