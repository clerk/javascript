import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';

export interface ConfirmationContext {
  run: () => Promise<void>;
  error: string | undefined;
}

export type ConfirmationEvent = { type: 'OPEN' } | { type: 'CONFIRM'; run: () => Promise<void> } | { type: 'CANCEL' };

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
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({ error: toMessage(event.error) })),
        },
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

export function useConfirmationController(): ConfirmationController {
  const [snapshot, send] = useMachine(confirmationMachine);

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'pending',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onConfirm: run => send({ type: 'CONFIRM', run }),
    isConfirming: snapshot.value === 'pending',
    errorMessage: snapshot.context.error,
  };
}
