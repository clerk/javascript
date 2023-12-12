import type { ClerkProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { navigate } from 'gatsby';
import React from 'react';

import { SDK_METADATA, TELEMETRY_DEBUG, TELEMETRY_DISABLED } from './constants';

export type GatsbyClerkProviderProps = {
  clerkState: any;
} & ClerkProviderProps;

export function ClerkProvider({ children, ...rest }: GatsbyClerkProviderProps) {
  const { clerkState, ...restProps } = rest;
  const { __clerk_ssr_state } = clerkState?.__internal_clerk_state || {};

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
      {children}
    </ReactClerkProvider>
  );
}
