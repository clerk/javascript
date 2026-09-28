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
      open={controller.phase !== 'inactive'}
      onOpenChange={open => {
        if (!open && controller.phase === 'active') {
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
