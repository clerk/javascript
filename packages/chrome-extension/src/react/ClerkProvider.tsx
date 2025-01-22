import type { Clerk } from '@clerk/clerk-js/no-rhc';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import { createClerkClient } from '../internal/clerk';
import type { StorageCache } from '../internal/utils/storage';

type ChromeExtensionClerkProviderProps = ClerkReactProviderProps & {
  /**
   * @experimental
   * @description Enables the listener to sync host cookies on changes.
   */
  __experimental_syncHostListener?: boolean;
  storageCache?: StorageCache;
  syncHost?: string;
};

export function ClerkProvider(props: ChromeExtensionClerkProviderProps): JSX.Element | null {
  const { children, storageCache, syncHost, __experimental_syncHostListener, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<Clerk | null>(null);

  React.useEffect(() => {
    void (async () => {
      setClerkInstance(
        await createClerkClient({ publishableKey, storageCache, syncHost, __experimental_syncHostListener }),
      );
    })();
  }, [publishableKey, storageCache, syncHost, __experimental_syncHostListener]);

  if (!clerkInstance) {
    return null;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={clerkInstance}
      standardBrowser={!syncHost}
    >
      {children}
    </ClerkReactProvider>
  );
}
