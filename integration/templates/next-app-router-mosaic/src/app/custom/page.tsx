'use client';

import { MosaicProvider, UserButton } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider
      experimental={{ newProfiles: true }}
      profile={{
        userProfileProps: {
          customPages: [{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }],
        },
      }}
    >
      <UserButton customMenuItems={[{ id: 'custom-link', label: 'Custom link', href: '/custom/link-target' }]} />
    </MosaicProvider>
  );
}
