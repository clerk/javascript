'use client';

import { MosaicProvider, Profile } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <Profile
        customPages={[{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }]}
        organizationProfileProps={{
          customPages: [{ label: 'Team page', path: 'team-page', content: <p>team-page-content</p> }],
        }}
      />
    </MosaicProvider>
  );
}
