import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

/**
 * Support for Remix ErrorBoundary v2.
 * You need to have the v2_errorBoundary flag enabled in your Remix config,
 * as shown here: https://remix.run/docs/en/main/route/error-boundary-v2
 *
 * @experimental This API is experimental and might change. This API will become stable
 * once Remix officially releases v2.
 */
export function V2_ClerkErrorBoundary(RootErrorBoundary?: React.ComponentType) {
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
