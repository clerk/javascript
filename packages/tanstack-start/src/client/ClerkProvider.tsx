import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { useRouteContext } from '@tanstack/react-router';
import { Asset } from '@tanstack/start';
import React from 'react';

import { ClerkOptionsProvider } from './OptionsContext.js';
import type { TanstackStartClerkProviderProps } from './types.js';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider({ children, ...restProps }: TanstackStartClerkProviderProps): JSX.Element {
  const contextRouter = useRouteContext({
    strict: false,
  });

  return (
    <>
      <Asset tag='script'>{`window.__clerk_init_state = ${JSON.stringify(contextRouter?.clerkStateContext)}`}</Asset>
      <ClerkOptionsProvider options={{}}>
        <ReactClerkProvider
          sdkMetadata={SDK_METADATA}
          {...restProps}
          publishableKey={
            typeof window !== 'undefined'
              ? window.__clerk_init_state.publishableKey
              : contextRouter?.clerkStateContext?.publishableKey
          }
        >
          {children}
        </ReactClerkProvider>
      </ClerkOptionsProvider>
    </>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
