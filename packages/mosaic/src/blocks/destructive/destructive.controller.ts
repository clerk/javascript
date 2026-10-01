import { isReverificationCancelledError } from '@clerk/shared/error';
import { useState } from 'react';

import type { ReverificationController } from '../../features/reverification';
import type { DestructiveControlledProps } from './destructive';

export type DestructiveController = Pick<
  DestructiveControlledProps,
  'open' | 'isDeleting' | 'errorMessage' | 'onOpenChange' | 'reverification' | 'step'
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
  const step = isDeleting && reverification?.visible ? 'verify' : 'confirm';

  return {
    open: status !== 'closed',
    isDeleting,
    errorMessage: status === 'open-error' ? destructiveState.errorMessage : undefined,
    reverification,
    step,
    openDestructiveDialog,
    onDelete: async () => {
      if (status === 'open-needs-confirmation' || status === 'open-error') {
        setDestructiveState({ status: 'open-pending' });
        try {
          await onDelete();
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
      const canCancel = Boolean(reverification?.onCancel);
      if (!nextIsOpen && isDeleting && !canCancel) {
        return;
      }

      if (nextIsOpen) {
        setDestructiveState({ status: 'open-needs-confirmation' });
      } else {
        reverification?.onCancel?.();
        setDestructiveState({ status: 'closed' });
      }
    },
  };
}
