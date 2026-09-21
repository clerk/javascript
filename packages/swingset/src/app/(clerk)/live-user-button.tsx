'use client';

import { UserButton } from '@clerk/mosaic/features/user-button/user-button';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';

export function LiveUserButton() {
  return (
    <MosaicProvider>
      <UserButton modePriority='user' />
    </MosaicProvider>
  );
}
