import { Button } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { useMessages } from '../../localization';
import { Reverification, type ReverificationController } from '../reverification';

export function UserProfileConnectedAccountsReverificationDialog({
  reverification,
  finalFocus,
}: {
  reverification: ReverificationController;
  finalFocus?: DialogFocusTarget;
}) {
  const m = useMessages('userProfileConnectedAccounts');
  const open = reverification.status === 'ready' || reverification.status === 'unavailable';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen && reverification.status !== 'idle') {
          reverification.onCancel?.();
        }
      }}
    >
      <Dialog.Popup
        variant='card'
        finalFocus={finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Reverification {...reverification} />
          <Card.Footer>
            <Button
              variant='outline'
              color='neutral'
              fullWidth
              disabled={reverification.phase === 'retrying'}
              onClick={reverification.status === 'idle' ? undefined : reverification.onCancel}
            >
              {m.reverificationCancel}
            </Button>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
