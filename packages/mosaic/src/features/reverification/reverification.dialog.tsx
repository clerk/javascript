import { Card } from '../../components/card';
import { Dialog, type DialogFocusTarget } from '../../components/dialog';
import { Reverification } from './reverification';
import type { ReverificationController } from './reverification.controller';

export function ReverificationDialog({
  finalFocus,
  ...controller
}: ReverificationController & { finalFocus?: DialogFocusTarget }) {
  return (
    <Dialog.Root
      open={controller.status === 'ready' || controller.status === 'unavailable' || controller.status === 'retrying'}
      onOpenChange={open => {
        if (!open) {
          controller.onCancel?.();
        }
      }}
    >
      <Dialog.Popup
        compactPlacement='sheet'
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Reverification {...controller} />
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
