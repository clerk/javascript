'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { UserButton } from '@clerk/ui/mosaic/user-button/user-button';

export function LiveUserButton() {
  return (
    <MosaicProvider>
      <UserButton modePriority='user' />
    </MosaicProvider>
  );
}
