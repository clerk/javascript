import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

export function ClerkErrorBoundary(RootErrorBoundary?: React.ComponentType) {
  return () => {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
      const { __clerk_ssr_interstitial_html } = error?.data?.clerkState?.__internal_clerk_state || {};
      if (__clerk_ssr_interstitial_html) {
        /**
         * In the (unlikely) case we trigger an interstitial during a client-side transition, we need to reload the page so the interstitial can properly trigger. Without a reload, the injected script tag does not get executed.
         * Notably, this currently triggers for satellite domain syncing.
         */
        if (typeof window !== 'undefined') {
          window.location.reload();
          return;
        }

        return <Interstitial html={__clerk_ssr_interstitial_html} />;
      }
    }

    if (!RootErrorBoundary) {
      return undefined;
    }

    return <RootErrorBoundary />;
  };
}
