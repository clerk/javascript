import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouteContext } from '@tanstack/react-router';
import { useEffect } from 'react';

import { isClient } from '../utils';
import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';
import { mergeWithPublicEnvs, pickFromClerkInitState } from './utils';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

export function ClerkProvider({ children, ...providerProps }: TanstackStartClerkProviderProps): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  const routerContext = useRouteContext({
    strict: false,
  });

  useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);

  const clerkInitState = isClient() ? (window as any).__clerk_init_state : routerContext?.clerkInitialState;

  const { clerkSsrState, ...restInitState } = pickFromClerkInitState(clerkInitState?.__internal_clerk_state);

  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps,
  };

  return (
    <>
      {routerContext?.clerkInitialState && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__clerk_init_state = ${JSON.stringify(routerContext?.clerkInitialState)};`,
          }}
        />
      )}
      <ClerkOptionsProvider options={mergedProps}>
        <ReactClerkProvider
          initialState={clerkSsrState}
          sdkMetadata={SDK_METADATA}
          {...mergedProps}
          routerPush={(to: string) =>
            awaitableNavigateRef.current?.({
              to,
              replace: false,
            })
          }
          routerReplace={(to: string) =>
            awaitableNavigateRef.current?.({
              to,
              replace: true,
            })
          }
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
