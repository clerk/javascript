import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { useRouter } from 'next/router';
import React from 'react';

export * from '@clerk/clerk-react';

const NO_FRONTEND_API_ERR =
  'The NEXT_PUBLIC_CLERK_FRONTEND_API environment variable must be set to use the ClerkProvider component.';

type NextClerkProviderProps = {
  children: React.ReactNode;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: NextClerkProviderProps): JSX.Element {
  // @ts-expect-error
  // Allow for overrides without making the type public
  const { frontendApi, __clerk_ssr_state, clerkJSUrl, ...restProps } = rest;
  const { push } = useRouter();

  if (frontendApi == undefined && !process.env.NEXT_PUBLIC_CLERK_FRONTEND_API) {
    throw Error(NO_FRONTEND_API_ERR);
  }

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  return (
    <ReactClerkProvider
      frontendApi={frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
      clerkJSUrl={clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS}
      navigate={to => push(to)}
      initialState={__clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
