'use client';

import { MosaicProvider, UserButton } from '@clerk/mosaic';
import { useState } from 'react';

export default function Page() {
  const [actionCount, setActionCount] = useState(0);

  return (
    <MosaicProvider>
      <p>custom-action-count-{actionCount}</p>
      <UserButton
        customMenuItems={[
          { id: 'custom-link', label: 'Custom link', href: '/custom/link-target' },
          { id: 'custom-action', label: 'Custom action', onClick: () => setActionCount(count => count + 1) },
        ]}
        menuItemOrder={['custom-action', 'custom-link']}
        userProfileProps={{
          customPages: [{ label: 'Custom page', path: 'custom-page', content: <p>custom-page-content</p> }],
        }}
      />
    </MosaicProvider>
  );
}
