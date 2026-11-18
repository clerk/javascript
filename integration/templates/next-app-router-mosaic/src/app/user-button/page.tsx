'use client';

import { MosaicProvider, UserButton } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <UserButton customMenuItems={[{ id: 'custom-link', label: 'Custom link', href: '/custom/link-target' }]} />
    </MosaicProvider>
  );
}
