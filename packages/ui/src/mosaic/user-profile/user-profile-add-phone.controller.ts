import { useEffect } from 'react';

import { setup } from '../machine/setup';
import { useMachine } from '../machine/useMachine';
import { userProfileAddPhoneMessages as m } from './user-profile-add-phone.messages';
import type { UserProfileAddPhoneViewProps } from './user-profile-add-phone.view';

export interface UserProfileAddPhoneControllerOptions {
  initialPhoneNumber?: string;
  onSend: (phoneNumber: string) => Promise<void>;
  onVerify: (phoneNumber: string, code: string) => Promise<void>;
}

interface Context extends UserProfileAddPhoneControllerOptions {
  phoneNumber: string;
  code: string;
  errorMessage: string | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'OPEN' }
  | { type: 'CANCEL' }
  | { type: 'RESEND' }
  | { type: 'TICK' }
  | { type: 'TYPE_PHONE'; value: string }
  | { type: 'TYPE_CODE'; value: string }
  | { type: 'SUBMIT'; code?: string };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Add phone callbacks are missing'));
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : m.error;
}

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const machine = createMachine({
  id: 'addPhone',
  initial: 'idle',
  context: {
    onSend: missingDependency,
    onVerify: missingDependency,
    phoneNumber: '',
    code: '',
    errorMessage: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'phone',
          actions: assign(context => ({
            phoneNumber: context.initialPhoneNumber ?? '',
            code: '',
            errorMessage: undefined,
            resendSeconds: 0,
          })),
        },
      },
    },
    phone: {
      on: {
        CANCEL: 'idle',
        TYPE_PHONE: { actions: assign((_, event) => ({ phoneNumber: event.value, errorMessage: undefined })) },
        SUBMIT: { target: 'sending', actions: assign(() => ({ errorMessage: undefined })) },
      },
    },
    sending: {
      invoke: fromPromise(context => context.onSend(context.phoneNumber), {
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'phone',
          actions: assign((_, event) => ({
            errorMessage: errorMessage(event.error),
          })),
        },
      }),
    },
    verify: {
      on: {
        CANCEL: 'idle',
        TICK: tick,
        RESEND: {
          target: 'resending',
          guard: context => context.resendSeconds === 0,
          actions: assign(() => ({ errorMessage: undefined })),
        },
        TYPE_CODE: { actions: assign((_, event) => ({ code: event.value, errorMessage: undefined })) },
        SUBMIT: {
          target: 'verifying',
          actions: assign((context, event) => ({ code: event.code ?? context.code, errorMessage: undefined })),
        },
      },
    },
    resending: {
      invoke: fromPromise(context => context.onSend(context.phoneNumber), {
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'verify',
          actions: assign((_, event) => ({
            errorMessage: errorMessage(event.error),
          })),
        },
      }),
    },
    verifying: {
      on: { TICK: tick },
      invoke: fromPromise(context => context.onVerify(context.phoneNumber, context.code), {
        onDone: 'idle',
        onError: {
          target: 'verify',
          actions: assign((_, event) => ({
            errorMessage: errorMessage(event.error),
          })),
        },
      }),
    },
  },
});

export function useUserProfileAddPhoneController(
  options: UserProfileAddPhoneControllerOptions,
): UserProfileAddPhoneViewProps {
  const [snapshot, send] = useMachine(machine, { context: options });
  const { resendSeconds } = snapshot.context;
  const open = snapshot.value !== 'idle';
  useEffect(() => {
    if (!open || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [open, resendSeconds, send]);

  return {
    resendSeconds,
    isResending: snapshot.value === 'resending',
    open,
    step:
      snapshot.value === 'verify' || snapshot.value === 'verifying' || snapshot.value === 'resending'
        ? 'verify'
        : 'phone',
    phoneNumber: snapshot.context.phoneNumber,
    code: snapshot.context.code,
    errorMessage: snapshot.context.errorMessage,
    isPending: snapshot.value === 'sending' || snapshot.value === 'verifying',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onPhoneNumberChange: value => send({ type: 'TYPE_PHONE', value }),
    onCodeChange: value => send({ type: 'TYPE_CODE', value }),
    onSubmit: code => send({ type: 'SUBMIT', code }),
    onResend: () => send({ type: 'RESEND' }),
  };
}
