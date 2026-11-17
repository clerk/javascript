'use client';

import { MosaicProvider, OrganizationProfile } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <OrganizationProfile
        customPages={[{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }]}
      />
    </MosaicProvider>
  );
}
