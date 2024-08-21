import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { ScriptOnce, useRouteContext } from '@tanstack/react-router';

import { isClient } from '../utils';
import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';
import { mergeWithPublicEnvs, pickFromClerkInitState } from './utils';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider({ children, ...providerProps }: TanstackStartClerkProviderProps): JSX.Element {
  const routerContext = useRouteContext({
    strict: false,
  });

  const clerkInitState = isClient() ? (window as any).__clerk_init_state : routerContext?.clerkInitialState;

  const { clerkSsrState, ...restInitState } = pickFromClerkInitState(clerkInitState?.__internal_clerk_state);

  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps,
  };

  return (
    <>
      <ScriptOnce>{`window.__clerk_init_state = ${JSON.stringify(routerContext?.clerkInitialState)};`}</ScriptOnce>
      <ClerkOptionsProvider options={mergedProps}>
        <ReactClerkProvider
          initialState={clerkSsrState}
          sdkMetadata={SDK_METADATA}
          {...mergedProps}
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
