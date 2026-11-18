'use client';

import { Switcher, MosaicProvider } from '@clerk/mosaic';

export function MosaicSwitcher() {
  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <Switcher />
    </MosaicProvider>
  );
}
