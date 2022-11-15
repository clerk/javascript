import { __internal__setErrorThrowerOptions, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { useRouter } from 'next/router';
import React from 'react';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/nextjs',
});

export * from '@clerk/clerk-react';

type NextClerkProviderProps = {
  children: React.ReactNode;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: NextClerkProviderProps): JSX.Element {
  // @ts-expect-error
  // Allow for overrides without making the type public
  const { authServerSideProps, __clerk_ssr_state, clerkJSUrl, ...restProps } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  return (
    <ReactClerkProvider
      clerkJSUrl={clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS}
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
