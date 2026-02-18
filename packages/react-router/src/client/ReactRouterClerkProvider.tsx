import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import React from 'react';

import {
  assertPublishableKeyInSpaMode,
  assertValidClerkState,
  isSpaMode as _isSpaMode,
  warnForSsr,
} from '../utils/assert';
import { ClerkReactRouterOptionsProvider } from './ReactRouterOptionsContext';
import type { ClerkState, ReactRouterClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/react';

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
type ClerkProviderPropsWithState<TUi extends Ui = Ui> = ReactRouterClerkProviderProps<TUi> & {
  clerkState?: ClerkState;
};

function ClerkProviderBase<TUi extends Ui = Ui>({ children, ...rest }: ClerkProviderPropsWithState<TUi>) {
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
    __signInForceRedirectUrl,
    __signUpForceRedirectUrl,
    __signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl,
    __clerkJSUrl,
    __clerkJSVersion,
    __clerkUIUrl,
    __prefetchUI,
    __telemetryDisabled,
    __telemetryDebug,
    __keylessClaimUrl,
    __keylessApiKeysUrl,
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
    signInForceRedirectUrl: __signInForceRedirectUrl,
    signUpForceRedirectUrl: __signUpForceRedirectUrl,
    signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
    __internal_clerkJSUrl: __clerkJSUrl,
    __internal_clerkJSVersion: __clerkJSVersion,
    __internal_clerkUIUrl: __clerkUIUrl,
    prefetchUI: __prefetchUI,
    telemetry: {
      disabled: __telemetryDisabled,
      debug: __telemetryDebug,
    },
  };

  const keylessProps = __keylessClaimUrl
    ? {
        __internal_keyless_claimKeylessApplicationUrl: __keylessClaimUrl,
        __internal_keyless_copyInstanceKeysUrl: __keylessApiKeysUrl,
      }
    : {};

  return (
    <ClerkReactRouterOptionsProvider options={mergedProps}>
      <ReactClerkProvider
        routerPush={(to: string) => awaitableNavigateRef.current?.(to)}
        routerReplace={(to: string) => awaitableNavigateRef.current?.(to, { replace: true })}
        initialState={__clerk_ssr_state}
        sdkMetadata={SDK_METADATA}
        {...mergedProps}
        {...keylessProps}
        {...restProps}
      >
        {children}
      </ReactClerkProvider>
    </ClerkReactRouterOptionsProvider>
  );
}

type ClerkReactRouterOptions<TUi extends Ui = Ui> = Partial<
  Omit<ReactRouterClerkProviderProps<TUi>, 'routerPush' | 'routerReplace' | 'clerkState'>
>;

// TODO: Remove "any" on loaderData type and use Route.ComponentProps from userland code
type ClerkProviderProps<TUi extends Ui = Ui> = ClerkReactRouterOptions<TUi> & {
  loaderData?: any;
};

export const ClerkProvider = <TUi extends Ui = Ui>({ children, loaderData, ...opts }: ClerkProviderProps<TUi>) => {
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
