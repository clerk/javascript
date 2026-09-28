import { isReverificationCancelledError } from '@clerk/shared/error';

import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';

export interface ConfirmationContext {
  run: () => Promise<void>;
  error: string | undefined;
}

export type ConfirmationEvent =
  | { type: 'OPEN' }
  | { type: 'CONFIRM'; run: () => Promise<void> }
  | { type: 'CANCEL' }
  | { type: 'CANCEL_REVERIFICATION' };

const { createMachine, assign, fromPromise } = setup<ConfirmationContext, ConfirmationEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('confirmation run is not seated'));
}

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong. Please try again.';
}

export const confirmationMachine = createMachine({
  id: 'confirmation',
  initial: 'idle',
  context: {
    run: notSeated,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: { target: 'confirming', actions: assign(() => ({ error: undefined })) },
      },
    },
    confirming: {
      on: {
        CONFIRM: { target: 'pending', actions: assign((_, event) => ({ run: event.run })) },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    pending: {
      on: {
        CANCEL_REVERIFICATION: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: [
          {
            guard: (_, event) => isReverificationCancelledError(event.error),
            target: 'idle',
            actions: assign(() => ({ error: undefined })),
          },
          {
            target: 'confirming',
            actions: assign((_, event) => ({ error: toMessage(event.error) })),
          },
        ],
      }),
    },
  },
});

export interface ConfirmationController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (run: () => Promise<void>) => void;
  isConfirming: boolean;
  errorMessage: string | undefined;
}

export function useConfirmationController({
  canCancelPending = false,
}: { canCancelPending?: boolean } = {}): ConfirmationController {
  const [snapshot, send] = useMachine(confirmationMachine);

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'pending',
    onOpenChange: open => {
      if (open) {
        send({ type: 'OPEN' });
      } else if (canCancelPending && snapshot.value === 'pending') {
        send({ type: 'CANCEL_REVERIFICATION' });
      } else {
        send({ type: 'CANCEL' });
      }
    },
    onConfirm: run => send({ type: 'CONFIRM', run }),
    isConfirming: snapshot.value === 'pending',
    errorMessage: snapshot.context.error,
  };
}
