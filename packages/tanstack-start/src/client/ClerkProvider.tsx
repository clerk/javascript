import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouteContext } from '@tanstack/react-router';
import React from 'react';

import { ClerkOptionsProvider } from './OptionsContext.js';
import type { TanstackStartClerkProviderProps } from './types.js';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider({ children, ...restProps }: TanstackStartClerkProviderProps): JSX.Element {
  // we can take the the clerk state from route context here
  const contextRouter = useRouteContext({
    strict: false,
  });
  const { clerkStateContext } = contextRouter || {};

  console.log('clerkState', clerkStateContext);

  return (
    <ClerkOptionsProvider
      options={{
        publishableKey: clerkStateContext?.publishableKey,
      }}
    >
      <ReactClerkProvider
        sdkMetadata={SDK_METADATA}
        {...restProps}
        publishableKey={clerkStateContext?.publishableKey}
      >
        {children}
      </ReactClerkProvider>
    </ClerkOptionsProvider>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
