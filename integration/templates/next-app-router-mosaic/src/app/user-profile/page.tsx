'use client';

import { MosaicProvider, UserProfile } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <UserProfile customPages={[{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }]} />
    </MosaicProvider>
  );
}
