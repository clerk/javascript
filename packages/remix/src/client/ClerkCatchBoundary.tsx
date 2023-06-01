import { useCatch } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

export function ClerkCatchBoundary(RootCatchBoundary?: React.ComponentType) {
  return () => {
    const { data } = useCatch();
    const { __clerk_ssr_interstitial_html } = data?.clerkState?.__internal_clerk_state || {};

    if (__clerk_ssr_interstitial_html) {
      return <Interstitial html={__clerk_ssr_interstitial_html} />;
    }

    if (!RootCatchBoundary) {
      return undefined;
    }

    return <RootCatchBoundary />;
  };
}
