'use client';

import { MosaicProvider, OrganizationSwitcher } from '@clerk/mosaic';

export default function Page() {
  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <OrganizationSwitcher
        customMenuItems={[{ id: 'custom-link', label: 'Custom link', href: '/custom/link-target' }]}
        organizationProfileProps={{
          customPages: [{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }],
        }}
      />
    </MosaicProvider>
  );
}
