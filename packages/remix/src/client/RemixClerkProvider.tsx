import { __internal__setErrorThrowerOptions, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import React from 'react';

import { assertFrontendApi, assertValidClerkState, warnForSsr } from '../utils';
import { ClerkState } from './types';
import { useAwaitableNavigate } from './useAwaitableNavigate';

__internal__setErrorThrowerOptions({ packageName: '@clerk/remix' });

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
  const { __clerk_ssr_state, __frontendApi, __publishableKey, __lastAuthResult } =
    clerkState?.__internal_clerk_state || {};

  React.useEffect(() => {
    warnForSsr(clerkState);
  }, []);

  React.useEffect(() => {
    (window as any).__clerk_debug = { __lastAuthResult };
  }, []);

  assertFrontendApi(__frontendApi);

  return (
    // @ts-expect-error
    <ReactClerkProvider
      frontendApi={__frontendApi}
      publishableKey={__publishableKey}
      clerkJSUrl={clerkJSUrl}
      navigate={awaitableNavigate}
      initialState={__clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
