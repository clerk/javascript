import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ReactClerkProvider } from '@clerk/react/internal';
import { ui } from '@clerk/ui';
import type { ReactNode } from 'react';

import { createClerkInstance } from './create-clerk-instance';

type OAuthTransport = {
  getRedirectUrl: () => string | Promise<string>;
  open: (url: URL) => Promise<{ callbackUrl: string }>;
};

const ElectronReactClerkProvider = ReactClerkProvider as unknown as (
  props: ReactClerkProviderProps & {
    Clerk: ReturnType<typeof createClerkInstance>;
    __internal_oauthTransport?: OAuthTransport;
    children: ReactNode;
    publishableKey: string;
    standardBrowser: false;
    ui: typeof ui;
  },
) => JSX.Element;

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

function createOAuthTransport(): OAuthTransport | undefined {
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
    <ElectronReactClerkProvider
      {...props}
      Clerk={clerk}
      __internal_oauthTransport={oauthTransport}
      publishableKey={publishableKey}
      standardBrowser={false}
      ui={ui}
    >
      {children}
    </ElectronReactClerkProvider>
  );
}

export * from '@clerk/react';
