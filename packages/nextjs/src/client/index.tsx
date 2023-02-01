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
    ...restProps
  } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
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
