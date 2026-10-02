import type { LocalizableError } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/form-error';

export interface ConfirmationContext {
  run: () => Promise<void>;
  error: LocalizableError | undefined;
}

export type ConfirmationEvent = { type: 'OPEN' } | { type: 'CONFIRM'; run: () => Promise<void> } | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<ConfirmationContext, ConfirmationEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('confirmation run is not seated'));
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
          actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
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
  const errorText = useErrorText();
  const { error } = snapshot.context;

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'pending',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onConfirm: run => send({ type: 'CONFIRM', run }),
    isConfirming: snapshot.value === 'pending',
    errorMessage: error ? errorText(error) : undefined,
  };
}
