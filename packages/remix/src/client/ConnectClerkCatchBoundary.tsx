import { useCatch } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

export function ConnectClerkCatchBoundary(RootCatchBoundary?: () => JSX.Element) {
  return () => {
    const { data } = useCatch();
    const { __clerk_ssr_interstitial } = data?.clerkState?.__internal_clerk_state || {};

    if (__clerk_ssr_interstitial) {
      return <Interstitial html={__clerk_ssr_interstitial} />;
    }

    if (!RootCatchBoundary) {
      return undefined;
    }

    return <RootCatchBoundary />;
  };
}
