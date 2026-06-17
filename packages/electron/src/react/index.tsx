import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ReactClerkProvider } from '@clerk/react/internal';
import { loadClerkUIScript } from '@clerk/shared/loadClerkJsScript';
import type { ClerkUIConstructor } from '@clerk/shared/ui';
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

let cachedClerkUI: { promise: Promise<ClerkUIConstructor>; publishableKey: string } | null = null;

function loadClerkUI(publishableKey: string, props: Partial<ClerkProviderProps>): Promise<ClerkUIConstructor> {
  if (cachedClerkUI?.publishableKey === publishableKey) {
    return cachedClerkUI.promise;
  }

  // Undocumented escape hatch for self-hosting/proxying the UI bundle; not part of the public props.
  const { __internal_clerkUIUrl, __internal_clerkUIVersion } = props as {
    __internal_clerkUIUrl?: string;
    __internal_clerkUIVersion?: string;
  };

  const promise = loadClerkUIScript({
    publishableKey,
    proxyUrl: typeof props.proxyUrl === 'string' ? props.proxyUrl : undefined,
    domain: typeof props.domain === 'string' ? props.domain : undefined,
    nonce: props.nonce,
    __internal_clerkUIUrl,
    __internal_clerkUIVersion,
  }).then(() => {
    if (!window.__internal_ClerkUICtor) {
      throw new Error(
        'Clerk: Failed to load Clerk UI from the CDN. Ensure your Content Security Policy allows the Clerk Frontend API host in `script-src`. Contact support@clerk.com.',
      );
    }
    return window.__internal_ClerkUICtor;
  });

  cachedClerkUI = { promise, publishableKey };
  return promise;
}

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
  const clerkUI = loadClerkUI(publishableKey, props);

  return (
    <ReactClerkProvider
      {...props}
      Clerk={clerk}
      __internal_oauthTransport={oauthTransport}
      publishableKey={publishableKey}
      standardBrowser={false}
      ui={{ ClerkUI: clerkUI }}
    >
      {children}
    </ReactClerkProvider>
  );
}

export * from '@clerk/react';
