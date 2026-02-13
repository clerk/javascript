import type { Clerk } from '@clerk/clerk-js/no-rhc';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/react';
import { ui } from '@clerk/ui';
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
    setClerkInstance(createClerkClient({ publishableKey, storageCache, syncHost, __experimental_syncHostListener }));
  }, [publishableKey, storageCache, syncHost, __experimental_syncHostListener]);

  if (!clerkInstance) {
    return null;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={clerkInstance}
      ui={ui}
      standardBrowser={!syncHost}
    >
      {children}
    </ClerkReactProvider>
  );
}
