import type { Clerk } from '@clerk/clerk-js';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import { createClerkClient } from '../internal/clerk';
import type { StorageCache } from '../internal/utils/storage';

type ChromeExtensionClerkProviderProps = ClerkReactProviderProps & {
  storageCache?: StorageCache;
  syncSessionWithTab?: boolean;
};

export function ClerkProvider(props: ChromeExtensionClerkProviderProps): JSX.Element | null {
  const { children, storageCache, syncSessionWithTab, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<Clerk | null>(null);

  React.useEffect(() => {
    void (async () => {
      setClerkInstance(await createClerkClient({ publishableKey, storageCache, syncSessionWithTab }));
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!clerkInstance) {
    return null;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={clerkInstance}
      standardBrowser={!syncSessionWithTab}
    >
      {children}
    </ClerkReactProvider>
  );
}
