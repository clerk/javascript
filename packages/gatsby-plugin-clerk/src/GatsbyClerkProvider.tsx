import type { ClerkProviderProps } from '@clerk/clerk-react';
import {
  __internal__setErrorThrowerOptions,
  ClerkLoaded,
  ClerkProvider as ReactClerkProvider,
} from '@clerk/clerk-react';
import { navigate } from 'gatsby';
import React from 'react';

import { SDK_METADATA, TELEMETRY_DEBUG, TELEMETRY_DISABLED } from './constants';

__internal__setErrorThrowerOptions({ packageName: 'gatsby-plugin-clerk' });

export type GatsbyClerkProviderProps = {
  clerkState: any;
} & ClerkProviderProps;

export function ClerkProvider({ children, ...rest }: GatsbyClerkProviderProps) {
  const { clerkState, ...restProps } = rest;
  const { __clerk_ssr_state, __clerk_ssr_interstitial_html } = clerkState?.__internal_clerk_state || {};

  return (
    <ReactClerkProvider
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
      initialState={__clerk_ssr_state || {}}
      sdkMetadata={SDK_METADATA}
      telemetry={
        restProps?.telemetry ?? {
          disabled: TELEMETRY_DISABLED,
          debug: TELEMETRY_DEBUG,
        }
      }
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
