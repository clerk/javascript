import { __internal__setErrorThrowerOptions, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import type { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import type { PublishableKeyOrFrontendApi } from '@clerk/types';
import { useRouter } from 'next/router';
import React from 'react';

import { invalidateNextRouterNon200ResponseCache } from './invalidateNextRouterNon200ResponseCache';

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
  // @ts-expect-error
  // prettier-ignore
  const { authServerSideProps, frontendApi, publishableKey, proxyUrl, __clerk_ssr_state, clerkJSUrl, navigate: userNavigate, ...restProps } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  const navigate = async (to: string) => {
    await invalidateNextRouterNon200ResponseCache();
    return (userNavigate || push)(to);
  };

  return (
    <ReactClerkProvider
      frontendApi={frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || ''}
      publishableKey={publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      clerkJSUrl={clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS}
      // @ts-expect-error
      proxyUrl={proxyUrl || process.env.NEXT_PUBLIC_CLERK_PROXY_URL}
      navigate={navigate}
      // withServerSideAuth automatically injects __clerk_ssr_state
      // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
      initialState={authServerSideProps?.__clerk_ssr_state || __clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
