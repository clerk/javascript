'use client';

import { MosaicProvider, UserButton } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider>
      <UserButton
        customMenuItems={[{ id: 'custom-link', label: 'Custom link', href: '/custom/link-target' }]}
        userProfileProps={{
          customPages: [{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }],
        }}
      />
    </MosaicProvider>
  );
}
