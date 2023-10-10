import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import {
  __internal__setErrorThrowerOptions,
  ClerkLoaded,
  ClerkProvider as ReactClerkProvider,
} from '@clerk/clerk-react';
import { navigate } from 'gatsby';
import React from 'react';

import { name, version } from '../package.json';

const SDK_METADATA = {
  name,
  version,
};

__internal__setErrorThrowerOptions({ packageName: 'gatsby-plugin-clerk' });

export type GatsbyClerkProviderProps = {
  children: React.ReactNode;
  clerkState: any;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: GatsbyClerkProviderProps) {
  const { clerkState, ...restProps } = rest;
  const { __clerk_ssr_state, __clerk_ssr_interstitial_html } = clerkState?.__internal_clerk_state || {};

  return (
    <ReactClerkProvider
      navigate={to => navigate(to)}
      initialState={__clerk_ssr_state || {}}
      sdkMetadata={SDK_METADATA}
      {...restProps}
    >
      {__clerk_ssr_interstitial_html ? (
        <ClerkLoaded>
          <Interstitial html={__clerk_ssr_interstitial_html} />
        </ClerkLoaded>
      ) : (
        children
      )}
    </ReactClerkProvider>
  );
}

export function Interstitial({ html }: { html: string }) {
  return <html dangerouslySetInnerHTML={{ __html: html }} />;
}
