import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import React from 'react';

import {
  assertPublishableKeyInSpaMode,
  assertValidClerkState,
  isSpaMode as _isSpaMode,
  warnForSsr,
} from '../utils/assert';
import { ClerkReactRouterOptionsProvider } from './ReactRouterOptionsContext';
import type { ClerkState, ReactRouterClerkProviderProps, ReactRouterComponentProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

/**
 * React Router hydration errors should not stop Clerk navigation from working, as the components mount only after
 * hydration is done (in the case of a hydration error, the components will simply mount after client-side hydration).
 */
const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

/**
 * Internal type that includes the initial state prop that is passed to the ClerkProvider during SSR.
 * This is a value that we pass automatically so it does not need to pollute the public API.
 */
type ClerkProviderPropsWithState = ReactRouterClerkProviderProps & {
  clerkState?: ClerkState;
};

function ClerkProviderBase({ children, ...rest }: ClerkProviderPropsWithState) {
  const awaitableNavigate = useAwaitableNavigate();
  const isSpaMode = _isSpaMode();

  React.useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);

  const { clerkState, ...restProps } = rest;
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  if (typeof isSpaMode !== 'undefined' && !isSpaMode) {
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
    if (typeof isSpaMode !== 'undefined' && !isSpaMode) {
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

type ClerkReactRouterOptions = Partial<
  Omit<ReactRouterClerkProviderProps, 'routerPush' | 'routerReplace' | 'clerkState'>
>;

// TODO: Remove "any" on loaderData type
type ClerkProviderProps = ClerkReactRouterOptions & {
  loaderData?: ReactRouterComponentProps['loaderData'];
};

export const ClerkProvider = ({ children, loaderData, ...opts }: ClerkProviderProps) => {
  let clerkState;
  const isSpaMode = _isSpaMode();

  // Don't use `loaderData` to fetch the clerk state if we're in SPA mode or if React Router is used as a library
  if (!isSpaMode && loaderData?.clerkState) {
    clerkState = loaderData.clerkState;
  }

  // In SPA mode the publishable key is required on the ClerkProvider
  if (typeof isSpaMode !== 'undefined' && isSpaMode) {
    assertPublishableKeyInSpaMode(opts.publishableKey);
  }

  return (
    <ClerkProviderBase
      {...(opts as ReactRouterClerkProviderProps)}
      clerkState={clerkState}
    >
      {children}
    </ClerkProviderBase>
  );
};
