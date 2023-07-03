import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

/*
 * V2_ClerkErrorBoundary needs the `v2_errorBoundary` future flag to be enabled.
 */
export function V2_ClerkErrorBoundary(RootErrorBoundary?: React.ComponentType) {
  return () => {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
      const { __clerk_ssr_interstitial_html } = error?.data?.clerkState?.__internal_clerk_state || {};
      if (__clerk_ssr_interstitial_html) {
        return <Interstitial html={__clerk_ssr_interstitial_html} />;
      }
    }

    if (!RootErrorBoundary) {
      return undefined;
    }

    return <RootErrorBoundary />;
  };
}
