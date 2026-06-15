/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type { HTMLAttributes } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Dialog',
  source: 'packages/ui/src/mosaic/components/dialog.tsx',
};

export function Default() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(props: Omit<HTMLAttributes<HTMLElement>, 'color'>) => <Button {...props}>Open dialog</Button>}
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title>Confirm action</Dialog.Title>
            <Dialog.Description>Are you sure you want to proceed? This action cannot be undone.</Dialog.Description>
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
