import { __internal__setErrorThrowerOptions, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import type { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import type { PublishableKeyOrFrontendApi } from '@clerk/types';
import { useRouter } from 'next/router';
import React from 'react';

import { invalidateNextRouterCache } from './invalidateNextRouterCache';

// TODO: Import from shared once [JS-118] is done
const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

__internal__setErrorThrowerOptions({
  packageName: '@clerk/nextjs',
});

export * from '@clerk/clerk-react';

type NextClerkProviderProps = {
  children: React.ReactNode;
  /**
   * If set to true, the NextJS middleware will be invoked
   * every time the client-side auth state changes (sign-out, sign-in, organization switch etc.).
   * That way, any auth-dependent logic can be placed inside the middleware.
   * Example: Configuring the middleware to force a redirect to `/sign-in` when the user signs out
   *
   * @default true
   */
  __unstable_invokeMiddlewareOnAuthStateChange: boolean;
} & Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
  Partial<PublishableKeyOrFrontendApi>;

export function ClerkProvider({ children, ...rest }: NextClerkProviderProps): JSX.Element {
  // Allow for overrides without making the type public
  const {
    // @ts-expect-error
    authServerSideProps,
    frontendApi,
    publishableKey,
    // @ts-expect-error
    proxyUrl,
    // @ts-expect-error
    domain,
    // @ts-expect-error
    __clerk_ssr_state,
    clerkJSUrl,
    __unstable_invokeMiddlewareOnAuthStateChange = true,
    ...restProps
  } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        void push(window.location.href);
      }
    };
  }, []);

  return (
    <ReactClerkProvider
      frontendApi={frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || ''}
      publishableKey={publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      clerkJSUrl={clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS}
      // @ts-expect-error
      proxyUrl={proxyUrl || process.env.NEXT_PUBLIC_CLERK_PROXY_URL || ''}
      domain={domain || ''}
      navigate={to => push(to)}
      // withServerSideAuth automatically injects __clerk_ssr_state
      // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
      initialState={authServerSideProps?.__clerk_ssr_state || __clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
