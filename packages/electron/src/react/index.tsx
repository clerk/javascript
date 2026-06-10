import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ReactClerkProvider } from '@clerk/react/internal';
import { ui } from '@clerk/ui';
import type { ReactNode } from 'react';

import { createClerkInstance } from './create-clerk-instance';

export type ClerkProviderProps = Omit<
  ReactClerkProviderProps,
  'Clerk' | 'children' | 'publishableKey' | 'standardBrowser' | 'ui'
> & {
  children: ReactNode;
  /**
   * Your Clerk publishable key, available in the Clerk Dashboard.
   */
  publishableKey: string;
};

export function ClerkProvider({ children, publishableKey, ...props }: ClerkProviderProps): JSX.Element {
  const clerk = createClerkInstance(publishableKey);

  return (
    <ReactClerkProvider
      {...props}
      Clerk={clerk}
      publishableKey={publishableKey}
      standardBrowser={false}
      ui={ui}
    >
      {children}
    </ReactClerkProvider>
  );
}

export * from '@clerk/react';
