import { isReverificationCancelledError } from '@clerk/shared/error';
import { useState } from 'react';

import type { ReverificationController } from '../../features/reverification';
import type { DestructiveProps } from './destructive';

export type DestructiveController = Pick<
  DestructiveProps,
  'open' | 'isDeleting' | 'errorMessage' | 'onOpenChange' | 'reverification'
> & {
  onDelete: () => Promise<unknown>;
  openDestructiveDialog: () => void;
};

type DestructiveState =
  | { status: 'closed' }
  | { status: 'open-needs-confirmation' }
  | { status: 'open-pending' }
  | { status: 'open-error'; errorMessage: string };

/** Optional controller for use with Destructive block */
export function useDestructiveController({
  onDelete,
  reverification,
}: {
  onDelete: () => Promise<unknown>;
  reverification?: ReverificationController;
}): DestructiveController {
  const [destructiveState, setDestructiveState] = useState<DestructiveState>({ status: 'closed' });
  const { status } = destructiveState;

  const openDestructiveDialog = () => {
    if (status === 'closed') {
      setDestructiveState({ status: 'open-needs-confirmation' });
    }
  };

  const isDeleting = status === 'open-pending';

  return {
    open: status !== 'closed',
    isDeleting,
    errorMessage: status === 'open-error' ? destructiveState.errorMessage : undefined,
    reverification,
    openDestructiveDialog,
    onDelete: async () => {
      if (status === 'open-needs-confirmation' || status === 'open-error') {
        setDestructiveState({ status: 'open-pending' });
        try {
          await onDelete();
          // TODO: It's possible this might give a flash of the confirm page after
          //       reverification.
          //       While we do stay on the current page throughout the retry, the
          //       useReverificationWithState `.finally` runs first and sets phase
          //       to inactive. That resets the reverification state and this
          //       dialog could flash to the first screen. Unconfirmed.
          setDestructiveState({ status: 'closed' });
        } catch (error: unknown) {
          if (isReverificationCancelledError(error)) {
            setDestructiveState({ status: 'closed' });
            return;
          }
          // TODO: Better error handling, localization
          setDestructiveState({ status: 'open-error', errorMessage: 'Something went wrong' });
        }
      }
    },
    onOpenChange: nextIsOpen => {
      const pendingForReverification = reverification?.phase === 'active';
      if (!nextIsOpen && isDeleting && !pendingForReverification) {
        return;
      }

      if (nextIsOpen) {
        setDestructiveState({ status: 'open-needs-confirmation' });
      } else {
        setDestructiveState({ status: 'closed' });
      }
    },
  };
}
