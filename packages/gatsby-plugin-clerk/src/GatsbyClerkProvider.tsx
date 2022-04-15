import { ClerkLoaded, ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { navigate } from 'gatsby';
import React from 'react';

import { assertFrontendApi } from './utils';

export type GatsbyClerkProviderProps = {
  children: React.ReactNode;
  clerkState: any;
  frontendApi: string;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: GatsbyClerkProviderProps) {
  const { clerkJSUrl, clerkState, frontendApi, ...restProps } = rest;
  const { __clerk_ssr_state, __clerk_ssr_interstitial } = clerkState?.__internal_clerk_state || {};

  assertFrontendApi(frontendApi);

  return (
    <ReactClerkProvider
      frontendApi={frontendApi}
      clerkJSUrl={clerkJSUrl}
      navigate={to => navigate(to)}
      initialState={__clerk_ssr_state || {}}
      {...restProps}
    >
      {__clerk_ssr_interstitial ? (
        <ClerkLoaded>
          <Reload />
        </ClerkLoaded>
      ) : (
        children
      )}
    </ReactClerkProvider>
  );
}

const Reload = () => {
  React.useEffect(() => {
    // TODO: Add fix for firefox edge case
    if (window.location.href.indexOf('#') === -1) {
      window.location.href = window.location.href;
    } else {
      window.location.reload();
    }
  }, []);
  return null;
};
