import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import React from 'react';

import { assertFrontendApi, assertValidClerkState, warnForSsr } from '../utils';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/clerk-react';

export type RemixClerkProviderProps<ClerkStateT extends { __type: 'clerkState' } = any> = {
  children: React.ReactNode;
  clerkState: ClerkStateT;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: RemixClerkProviderProps): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  const { clerkJSUrl, clerkState, ...restProps } = rest;
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
      navigate={awaitableNavigate}
      initialState={__clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
