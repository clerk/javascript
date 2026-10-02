import { isReverificationCancelledError } from '@clerk/shared/error';
import { useState } from 'react';

import type { ReverificationController } from '../../features/reverification';
import type { LocalizableError } from '../../localization';
import { useErrorText } from '../../localization';
import { toLocalizableError } from '../../utils/form-error';
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
  | { status: 'open-error'; error: LocalizableError };

/** Optional controller for use with Destructive block */
export function useDestructiveController({
  onDelete,
  reverification,
  errorFallback,
}: {
  onDelete: () => Promise<unknown>;
  reverification?: ReverificationController;
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}): DestructiveController {
  const [destructiveState, setDestructiveState] = useState<DestructiveState>({ status: 'closed' });
  const errorText = useErrorText();
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
    errorMessage:
      destructiveState.status === 'open-error' ? errorText(destructiveState.error, errorFallback) : undefined,
    reverification,
    step,
    openDestructiveDialog,
    onDelete: async () => {
      if (status === 'open-needs-confirmation' || status === 'open-error') {
        reverification?.reset();
        setDestructiveState({ status: 'open-pending' });
        try {
          await onDelete();
          setDestructiveState({ status: 'closed' });
        } catch (error: unknown) {
          if (isReverificationCancelledError(error)) {
            setDestructiveState({ status: 'closed' });
            return;
          }
          setDestructiveState({ status: 'open-error', error: toLocalizableError(error) });
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
