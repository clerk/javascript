import type { Clerk } from '@clerk/clerk-js';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

import { createClerkClient } from '../internal/clerk';
import type { StorageCache } from '../internal/utils/storage';

type ChromeExtensionClerkProviderProps = ClerkReactProviderProps & {
  storageCache?: StorageCache;
  syncSessionWithTab?: boolean;
};

function useClerkInstance({
  publishableKey,
  storageCache,
  syncSessionWithTab,
}: Pick<ChromeExtensionClerkProviderProps, 'publishableKey' | 'storageCache' | 'syncSessionWithTab'>): Clerk | null {
  const [clerkInstance, setClerkInstance] = useState<Clerk | null>(null);

  useEffect(() => {
    void (async () => {
      setClerkInstance(await createClerkClient({ publishableKey, storageCache, syncSessionWithTab }));
    })();
  }, [publishableKey, storageCache, syncSessionWithTab]);

  return clerkInstance;
}

export function ClerkProvider(props: ChromeExtensionClerkProviderProps): JSX.Element | null {
  const { children, storageCache, syncSessionWithTab, ...rest } = props;
  const { publishableKey = '' } = rest;

  const instance = useClerkInstance({ publishableKey, storageCache, syncSessionWithTab });

  if (!instance) {
    return null;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={instance}
      standardBrowser={!syncSessionWithTab}
    >
      {children}
    </ClerkReactProvider>
  );
}
