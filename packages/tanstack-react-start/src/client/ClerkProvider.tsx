import { ClerkProvider as ReactClerkProvider } from '@clerk/react';
import { ScriptOnce } from '@tanstack/react-router';
import { getGlobalStartContext } from '@tanstack/react-start';
import { useEffect } from 'react';

import { isClient } from '../utils';
import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';
import { mergeWithPublicEnvs, pickFromClerkInitState } from './utils';

export * from '@clerk/react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const awaitableNavigateRef: { current: ReturnType<typeof useAwaitableNavigate> | undefined } = { current: undefined };

export function ClerkProvider({ children, ...providerProps }: TanstackStartClerkProviderProps): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  // @ts-expect-error: Untyped internal Clerk initial state
  const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};

  useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);

  const clerkInitState = isClient() ? (window as any).__clerk_init_state : clerkInitialState;

  const { clerkSsrState, ...restInitState } = pickFromClerkInitState(clerkInitState?.__internal_clerk_state);

  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps,
  };

  return (
    <>
      <ScriptOnce>{`window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};`}</ScriptOnce>
      <ClerkOptionsProvider options={mergedProps}>
        <ReactClerkProvider
          initialState={clerkSsrState}
          sdkMetadata={SDK_METADATA}
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
          {...mergedProps}
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
