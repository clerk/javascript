'use client';

import { Switcher } from '@clerk/mosaic/features/switcher/switcher';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

export function LiveSwitcher() {
  return (
    <MosaicProvider>
      <Switcher triggerVariant='condensed' />
    </MosaicProvider>
  );
}
