import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { assertClerkState, warnForSsr } from './utils';

export * from '@clerk/clerk-react';

type RemixClerkProviderProps<ClerkStateT extends { __type: 'clerkState' } = any> = {
  frontendApi: string;
  children: React.ReactNode;
  clerkState?: ClerkStateT;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: RemixClerkProviderProps): JSX.Element {
  const { frontendApi, clerkJSUrl, clerkState, ...restProps } = rest;
  const navigate = useNavigate();
  ReactClerkProvider.displayName = 'ReactClerkProvider';

  assertClerkState(clerkState);
  React.useEffect(() => {
    warnForSsr(clerkState);
  }, []);

  const { __clerk_ssr_interstitial, __clerk_ssr_state } = clerkState?.__internal_clerk_state || {};
  if (__clerk_ssr_interstitial) {
    return <html dangerouslySetInnerHTML={{ __html: __clerk_ssr_interstitial }} />;
  }

  return (
    <ReactClerkProvider
      frontendApi={frontendApi}
      clerkJSUrl={clerkJSUrl}
      navigate={to => navigate(to)}
      initialState={__clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
