'use client';

import { UserButton } from '@clerk/mosaic/features/user-button/user-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

export function LiveUserButton() {
  return (
    <MosaicProvider>
      <UserButton />
    </MosaicProvider>
  );
}
