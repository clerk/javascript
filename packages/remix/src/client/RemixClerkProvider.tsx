import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { useNavigate } from '@remix-run/react';
import React from 'react';

import { assertFrontendApi, assertValidClerkState, warnForSsr } from '../utils';

export * from '@clerk/clerk-react';

export type RemixClerkProviderProps<ClerkStateT extends { __type: 'clerkState' } = any> = {
  children: React.ReactNode;
  clerkState: ClerkStateT;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: RemixClerkProviderProps): JSX.Element {
  const { clerkJSUrl, clerkState, ...restProps } = rest;
  const navigate = useNavigate();
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  assertValidClerkState(clerkState);

  React.useEffect(() => {
    warnForSsr(clerkState);
  }, []);

  const { __clerk_ssr_state, __frontendApi } = clerkState?.__internal_clerk_state || {};

  assertFrontendApi(__frontendApi);

  return (
    <ReactClerkProvider
      frontendApi={__frontendApi}
      clerkJSUrl={clerkJSUrl}
      navigate={to => navigate(to)}
      initialState={__clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
