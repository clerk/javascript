import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/shared/error';
import { useState } from 'react';

import type { ReverificationController } from '../../features/reverification';
import type { LocalizableError } from '../../localization';
import { toLocalizableApiError, useErrorText } from '../../localization';
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
    errorMessage: status === 'open-error' ? destructiveState.errorMessage : undefined,
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
          setDestructiveState({ status: 'open-error', errorMessage: errorText(toLocalizableError(error)) });
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

function toLocalizableError(error: unknown): LocalizableError {
  const apiError = isClerkAPIResponseError(error) ? error.errors[0] : undefined;
  return apiError ? toLocalizableApiError(apiError) : {};
}
