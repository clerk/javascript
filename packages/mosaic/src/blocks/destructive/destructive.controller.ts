import { useState } from 'react';

import type { ActionContext } from '../../hooks/useAction';
import { useAction } from '../../hooks/useAction';
import type { Prompt } from '../../utils/prompt';
import type { DestructiveControlledProps } from './destructive';

export type DestructiveController = Pick<
  DestructiveControlledProps,
  'open' | 'isDeleting' | 'errorMessage' | 'onOpenChange' | 'prompt'
> & {
  onDelete: () => Promise<void>;
  openDestructiveDialog: () => void;
};

/** Optional controller for use with Destructive block */
export function useDestructiveController(
  onDelete: (ctx: ActionContext) => Promise<unknown>,
  prompt: Prompt | null = null,
): DestructiveController {
  const [open, setOpen] = useState(false);
  const action = useAction(async (ctx: ActionContext) => {
    ctx.onSettled(result => {
      if (result.status !== 'failed') {
        setOpen(false);
      }
    });
    return onDelete(ctx);
  });
  const { state } = action;
  const isDeleting = state.status === 'running';

  return {
    open,
    isDeleting,
    errorMessage: state.status === 'failed' ? 'Something went wrong' : undefined,
    prompt,
    openDestructiveDialog: () => setOpen(true),
    onDelete: async () => {
      await action.run();
    },
    onOpenChange: nextIsOpen => {
      if (nextIsOpen) {
        setOpen(true);
        return;
      }
      if (isDeleting) {
        prompt?.cancel?.();
        return;
      }
      action.reset();
      setOpen(false);
    },
  };
}
