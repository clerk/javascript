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
  return (
    <Dialog.Root
      open={controller.status !== 'idle'}
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
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Reverification controller={controller} />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
