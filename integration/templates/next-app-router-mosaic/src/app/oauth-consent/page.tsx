'use client';

import { MosaicProvider, OAuthConsent } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <OAuthConsent fallback={<p>consent-loading</p>} />
    </MosaicProvider>
  );
}
