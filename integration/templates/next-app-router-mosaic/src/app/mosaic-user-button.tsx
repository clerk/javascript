'use client';

import { Switcher, MosaicProvider } from '@clerk/mosaic';

export function MosaicUserButton() {
  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <Switcher />
    </MosaicProvider>
  );
}
