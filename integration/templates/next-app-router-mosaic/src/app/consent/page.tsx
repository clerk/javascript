'use client';

import { Consent, MosaicProvider } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <Consent />
    </MosaicProvider>
  );
}
