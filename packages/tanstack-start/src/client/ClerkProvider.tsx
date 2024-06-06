import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouteContext } from '@tanstack/react-router';
import { Asset } from '@tanstack/start';

import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const isServer = typeof window === 'undefined';

export function ClerkProvider({ children, ...restProps }: TanstackStartClerkProviderProps): JSX.Element {
  const contextRouter = useRouteContext({
    strict: false,
  });

  const clerkInitState = !isServer ? (window as any).__clerk_init_state : contextRouter?.clerkStateContext;

  const {
    __clerk_ssr_state,
    __publishableKey,
    __proxyUrl,
    __domain,
    __isSatellite,
    __signInUrl,
    __signUpUrl,
    __afterSignInUrl,
    __afterSignUpUrl,
    __clerkJSUrl,
    __clerkJSVersion,
    __telemetryDisabled,
    __telemetryDebug,
  } = clerkInitState.__internal_clerk_state || {};

  const mergedProps = {
    publishableKey: __publishableKey,
    proxyUrl: __proxyUrl,
    domain: __domain,
    isSatellite: __isSatellite,
    signInUrl: __signInUrl,
    signUpUrl: __signUpUrl,
    afterSignInUrl: __afterSignInUrl,
    afterSignUpUrl: __afterSignUpUrl,
    clerkJSUrl: __clerkJSUrl,
    clerkJSVersion: __clerkJSVersion,
    telemetry: {
      disabled: __telemetryDisabled,
      debug: __telemetryDebug,
    },
  };

  return (
    <>
      {/* TODO: revisit window.__clerk_init_state */}
      <Asset tag='script'>{`window.__clerk_init_state = ${JSON.stringify(contextRouter?.clerkStateContext)}`}</Asset>
      <ClerkOptionsProvider options={mergedProps}>
        <ReactClerkProvider
          initialState={__clerk_ssr_state}
          sdkMetadata={SDK_METADATA}
          {...mergedProps}
          {...restProps}
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
