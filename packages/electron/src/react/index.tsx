import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ReactClerkProvider } from '@clerk/react/internal';
import { ui } from '@clerk/ui';
import type { ReactNode } from 'react';

import { createClerkInstance } from './create-clerk-instance';

type ClerkOAuthTransport = NonNullable<ReactClerkProviderProps['__internal_oauthTransport']>;

export type ClerkProviderProps = Omit<
  ReactClerkProviderProps,
  'Clerk' | 'children' | 'publishableKey' | 'standardBrowser' | 'ui' | '__internal_oauthTransport'
> & {
  children: ReactNode;
  /**
   * Your Clerk publishable key, available in the Clerk Dashboard.
   */
  publishableKey: string;
};

function createOAuthTransport(): ClerkOAuthTransport | undefined {
  const bridge = window.__clerk_internal_electron?.oauthTransport;

  if (!bridge) {
    return undefined;
  }

  return {
    getRedirectUrl: () => bridge.getRedirectUrl(),
    open: url => bridge.open(url.href),
  };
}

export function ClerkProvider({ children, publishableKey, ...props }: ClerkProviderProps): JSX.Element {
  const clerk = createClerkInstance(publishableKey);
  const oauthTransport = createOAuthTransport();

  return (
    <ReactClerkProvider
      {...props}
      Clerk={clerk}
      __internal_oauthTransport={oauthTransport}
      publishableKey={publishableKey}
      standardBrowser={false}
      ui={ui}
    >
      {children}
    </ReactClerkProvider>
  );
}

export * from '@clerk/react';
