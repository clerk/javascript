import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import React from 'react';

import { ClerkOptionsProvider } from './OptionsContext';
import type { TanstackStartClerkProviderProps } from './types';

export * from '@clerk/clerk-react';

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export function ClerkProvider({ children, ...restProps }: TanstackStartClerkProviderProps): JSX.Element {
  // we can take the the clerk state from route context here
  // const router = useRouter();

  return (
    <ClerkOptionsProvider options={{}}>
      <ReactClerkProvider
        sdkMetadata={SDK_METADATA}
        {...restProps}
      >
        {children}
      </ReactClerkProvider>
    </ClerkOptionsProvider>
  );
}
ClerkProvider.displayName = 'ClerkProvider';
