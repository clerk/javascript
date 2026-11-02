import { useRef } from 'react';

import { Card } from '../../components/card';
import type { DialogFocusTarget } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import type { ReverificationController } from '../../features/reverification';
import { Reverification } from '../../features/reverification';

export interface ReverificationDialogProps {
  controller: ReverificationController;
  finalFocus?: DialogFocusTarget;
}

export function ReverificationDialog({ controller, finalFocus }: ReverificationDialogProps): JSX.Element {
  const initialFocusRef = useRef<HTMLElement>(null);

  return (
    <Dialog.Root
      open={controller.visible}
      onOpenChange={open => {
        if (!open) {
          controller.onCancel?.();
        }
      }}
      shouldCloseOnInteractOutside={false}
      showCloseButton={Boolean(controller.onCancel)}
    >
      <Dialog.Popup
        variant='card'
        initialFocus={controller.status === 'error' ? undefined : initialFocusRef}
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Reverification
            controller={controller}
            initialFocusRef={initialFocusRef}
          />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
