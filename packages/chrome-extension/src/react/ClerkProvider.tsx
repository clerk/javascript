import type { Clerk } from '@clerk/clerk-js/no-rhc';
import type { ClerkProviderProps as ClerkReactProviderProps } from '@clerk/react';
import { ClerkProvider as ClerkReactProvider } from '@clerk/react';
import type { Ui } from '@clerk/react/internal';
import { ui } from '@clerk/ui';
import React from 'react';

import { createClerkClient } from '../internal/clerk';
import type { StorageCache } from '../internal/utils/storage';

type ChromeExtensionClerkProviderProps<TUi extends Ui = Ui> = ClerkReactProviderProps<TUi> & {
  /**
   * @experimental
   * @description Enables the listener to sync host cookies on changes.
   */
  __experimental_syncHostListener?: boolean;
  storageCache?: StorageCache;
  syncHost?: string;
};

export function ClerkProvider<TUi extends Ui = Ui>(props: ChromeExtensionClerkProviderProps<TUi>): JSX.Element | null {
  const { children, storageCache, syncHost, __experimental_syncHostListener, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<Clerk | null>(null);

  React.useEffect(() => {
    setClerkInstance(createClerkClient({ publishableKey, storageCache, syncHost, __experimental_syncHostListener }));
  }, [publishableKey, storageCache, syncHost, __experimental_syncHostListener]);

  if (!clerkInstance) {
    return null;
  }

  // Chrome extension uses bundled UI via ui.ctor
  return (
    <ClerkReactProvider
      {...(rest as any)}
      Clerk={clerkInstance}
      clerkUiCtor={ui.ctor}
      standardBrowser={!syncHost}
    >
      {children}
    </ClerkReactProvider>
  );
}
