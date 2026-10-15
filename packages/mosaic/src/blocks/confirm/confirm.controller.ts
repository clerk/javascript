import { isReverificationCancelledError } from '@clerk/shared/error';
import { useMemo } from 'react';

import type { DialogHandle } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import type { ReverificationController } from '../../features/reverification';
import type { ErrorDescription } from '../../localization';
import { useErrorText } from '../../localization';
import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';

export interface ConfirmContext {
  run: () => Promise<void>;
  error: ErrorDescription | undefined;
}

export type ConfirmEvent = { type: 'OPEN' } | { type: 'CONFIRM'; run: () => Promise<void> } | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<ConfirmContext, ConfirmEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('confirm run is not seated'));
}

export const confirmMachine = createMachine({
  id: 'confirm',
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
        CONFIRM: { target: 'pending', actions: assign((_, event) => ({ run: event.run, error: undefined })) },
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
    },
    pending: {
      on: {
        CANCEL: { target: 'idle', actions: assign(() => ({ error: undefined })) },
      },
      invoke: fromPromise(context => context.run(), {
        onDone: { target: 'idle', actions: assign(() => ({ error: undefined })) },
        onError: [
          {
            guard: (_: ConfirmContext, event: ErrorInvokeEvent) => isReverificationCancelledError(event.error),
            target: 'idle',
          },
          {
            target: 'confirming',
            actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
          },
        ],
      }),
    },
  },
});

export type ConfirmStep = 'confirm' | 'verify';

export interface ConfirmController<Payload = void> {
  /** The underlying handle that manages the dialog. Normally not needed, but exposed if you want to pass it to a detached `Dialog.Trigger`. */
  handle: DialogHandle<Payload>;
  isOpen: boolean;
  isPending: boolean;
  /** Whether the dialog can close right now. False while the action is past the point of cancelling */
  canClose: boolean;
  errorMessage: string | undefined;
  /** Which card the dialog shows: the confirm step, or the reverification the action was interrupted by. */
  step: ConfirmStep;
  reverification: ReverificationController | undefined;
  /** Opens the dialog about `payload` */
  open: (payload: Payload) => void;
  onOpenChange: (open: boolean) => void;
  /** Runs the action for `payload`. The dialog closes when it resolves and shows why when it rejects. */
  confirm: (payload: Payload) => void;
}

export interface ConfirmControllerOptions<Payload = void> {
  /** The action the dialog confirms. Resolve to close; reject to keep the dialog open showing why. */
  onConfirm: (payload: Payload) => Promise<unknown> | void;
  /** The flow `onConfirm` runs under, when the action may need step-up verification. */
  reverification?: ReverificationController;
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}

/**
 * Owns a confirm dialog's lifecycle: open, pending, error, closed. One per action. Create it in the
 * wrapper or controller layer, hand it to a `Confirmation` or `Destructive` block as `controller`,
 * and open it from anywhere with `open(payload)`; the component derives its copy from the payload and
 * calls back `confirm(payload)` when the user answers.
 *
 * With `reverification`, the dialog switches to the verify step while the action is interrupted,
 * closes silently when the user cancels the challenge, and refuses to close while the action is
 * past the point of cancelling.
 */
export function useConfirmController<Payload = void>({
  onConfirm,
  reverification,
  errorFallback,
}: ConfirmControllerOptions<Payload>): ConfirmController<Payload> {
  const handle = useMemo(() => Dialog.createHandle<Payload>(), []);
  const [snapshot, send] = useMachine(confirmMachine);
  const errorText = useErrorText();
  const { error } = snapshot.context;
  const isPending = snapshot.value === 'pending';
  const canClose = !isPending || Boolean(reverification?.onCancel);

  return {
    handle,
    isOpen: snapshot.value !== 'idle',
    isPending,
    canClose,
    errorMessage: error ? errorText(error, errorFallback) : undefined,
    step: isPending && reverification?.visible ? 'verify' : 'confirm',
    reverification,
    open: payload => handle.open(payload),
    onOpenChange: open => {
      if (open) {
        send({ type: 'OPEN' });
        return;
      }
      if (!canClose) {
        return;
      }
      reverification?.onCancel?.();
      send({ type: 'CANCEL' });
    },
    confirm: payload => {
      if (snapshot.value !== 'confirming') {
        return;
      }
      reverification?.reset();
      send({
        type: 'CONFIRM',
        run: async () => {
          await onConfirm(payload);
        },
      });
    },
  };
}
