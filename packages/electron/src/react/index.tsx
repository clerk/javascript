import type { ClerkProviderProps as ReactClerkProviderProps } from '@clerk/react';
import { InternalClerkProvider as ReactClerkProvider } from '@clerk/react/internal';
import { isVirtualRouterPath } from '@clerk/shared/internal/clerk-js/url';
import { ALLOWED_PROTOCOLS } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { loadClerkUIScript } from '@clerk/shared/loadClerkJsScript';
import type { ClerkUIConstructor } from '@clerk/shared/ui';
import type { ReactNode } from 'react';

import type { PasskeySupport } from '../passkeys';
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
  /**
   * Enables passkey support. Pass the `passkeys` export from `@clerk/electron/passkeys`;
   * when omitted, no passkey code is bundled or initialized.
   *
   * @example
   * ```tsx
   * import { passkeys } from '@clerk/electron/passkeys';
   *
   * <ClerkProvider publishableKey={publishableKey} passkeys={passkeys} />
   * ```
   */
  passkeys?: PasskeySupport;
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

type ClerkRouterFn = NonNullable<ReactClerkProviderProps['routerPush']>;

/** Always supplied, so clerk-js never reaches `window.location` and reloads the renderer. */
function createRouterHandlers(
  routerPush: ClerkRouterFn | undefined,
  routerReplace: ClerkRouterFn | undefined,
): { routerPush: ClerkRouterFn; routerReplace: ClerkRouterFn } {
  const wrap =
    (delegate: ClerkRouterFn | undefined): ClerkRouterFn =>
    (to, metadata) => {
      if (isVirtualRouterPath(to)) {
        return;
      }

      if (delegate) {
        return delegate(to, metadata);
      }

      metadata?.windowNavigate(to);
    };

  return { routerPush: wrap(routerPush), routerReplace: wrap(routerReplace) };
}

/**
 * Infer the custom renderer scheme registered with `createClerkBridge({ renderer })`.
 * Built-in Clerk protocols and local file renderers are not inferred.
 */
function defaultAllowedRedirectProtocols(): string[] | undefined {
  const protocol = typeof window !== 'undefined' ? window.location?.protocol : undefined;

  if (!protocol || ALLOWED_PROTOCOLS.includes(protocol) || protocol === 'file:') {
    return undefined;
  }

  return [protocol];
}

export function ClerkProvider({
  children,
  publishableKey,
  passkeys,
  allowedRedirectProtocols,
  routerPush,
  routerReplace,
  ...props
}: ClerkProviderProps): JSX.Element {
  const clerk = createClerkInstance(publishableKey, passkeys);
  const oauthTransport = createOAuthTransport();
  const clerkUI = loadClerkUI(publishableKey, props);
  const routerHandlers = createRouterHandlers(routerPush, routerReplace);

  return (
    <ReactClerkProvider
      {...props}
      {...routerHandlers}
      Clerk={clerk}
      __internal_oauthTransport={oauthTransport}
      allowedRedirectProtocols={allowedRedirectProtocols ?? defaultAllowedRedirectProtocols()}
      publishableKey={publishableKey}
      standardBrowser={false}
      ui={{ ClerkUI: clerkUI }}
    >
      {children}
    </ReactClerkProvider>
  );
}

export * from '@clerk/react';
