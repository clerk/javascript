import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import React from 'react';

import { noFrontendApiError } from '../errors';
import { assertEnvVar, assertValidClerkState, warnForSsr } from '../utils';
import { ClerkState } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

export * from '@clerk/clerk-react';

export type RemixClerkProviderProps = {
  children: React.ReactNode;
  clerkState: ClerkState;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: RemixClerkProviderProps): JSX.Element {
  const awaitableNavigate = useAwaitableNavigate();
  const { clerkJSUrl, clerkState, ...restProps } = rest;
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  assertValidClerkState(clerkState);
  const { __clerk_ssr_state, __frontendApi, __clerk_debug } = clerkState?.__internal_clerk_state || {};

  React.useEffect(() => {
    warnForSsr(clerkState);
  }, []);

  React.useEffect(() => {
    (window as any).__clerk_debug = __clerk_debug;
  }, []);

  assertEnvVar(__frontendApi, noFrontendApiError);

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
