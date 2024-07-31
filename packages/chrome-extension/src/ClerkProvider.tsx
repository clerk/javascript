import type { Clerk } from '@clerk/clerk-js';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import { createClerkClient } from './clerk';
import type { ClerkClientExtensionFeatures } from './types';
import type { StorageCache } from './utils/storage';

type ChromeExtensionClerkProviderProps = ClerkReactProviderProps & {
  extensionFeatures?: ClerkClientExtensionFeatures;
  storageCache?: StorageCache;
  /** @deprecated Please use extensionFeatures.sync instead */
  syncSessionWithTab?: boolean;
};

export function ClerkProvider(props: ChromeExtensionClerkProviderProps): JSX.Element | null {
  const { children, extensionFeatures = {}, storageCache, syncSessionWithTab, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<Clerk | null>(null);

  React.useEffect(() => {
    void (async () => {
      if (syncSessionWithTab) {
        extensionFeatures.sync = true;
      }

      setClerkInstance(await createClerkClient({ publishableKey, storageCache, extensionFeatures }));
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
