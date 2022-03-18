import { LIB_VERSION } from '@clerk/clerk-react/dist/info';
import { useCatch } from '@remix-run/react';
import React from 'react';

import { Interstitial } from './Interstitial';

export function ConnectClerkCatchBoundary(RootCatchBoundary?: () => JSX.Element) {
  return () => {
    const { data } = useCatch();
    const { __clerk_ssr_interstitial, __frontendApi } = data?.clerkState?.__internal_clerk_state || {};

    if (__clerk_ssr_interstitial) {
      return <Interstitial frontendApi={__frontendApi} version={LIB_VERSION} />;
    }

    if (!RootCatchBoundary) {
      return undefined;
    }

    return <RootCatchBoundary />;
  };
}
