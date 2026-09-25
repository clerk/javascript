'use client';

import { MosaicProvider, UserButton } from '@clerk/mosaic';

export function MosaicUserButton() {
  return (
    <MosaicProvider>
      <UserButton />
    </MosaicProvider>
  );
}
