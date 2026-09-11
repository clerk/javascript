import { useEffect } from 'react';

import { setup } from '../machine/setup';
import { useMachine } from '../machine/useMachine';
import { userProfileAddEmailMessages as m } from './user-profile-add-email.messages';
import type { UserProfileAddEmailViewProps } from './user-profile-add-email.view';

export interface UserProfileAddEmailControllerOptions {
  initialEmailAddress?: string;
  onSend: (emailAddress: string) => Promise<void>;
  onVerify: (emailAddress: string, code: string) => Promise<void>;
}

interface Context extends UserProfileAddEmailControllerOptions {
  emailAddress: string;
  code: string;
  errorMessage: string | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'OPEN' }
  | { type: 'CANCEL' }
  | { type: 'RESEND' }
  | { type: 'TICK' }
  | { type: 'TYPE_EMAIL'; value: string }
  | { type: 'TYPE_CODE'; value: string }
  | { type: 'SUBMIT'; code?: string };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Add email callbacks are missing'));
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : m.error;
}

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const machine = createMachine({
  id: 'addEmail',
  initial: 'idle',
  context: {
    onSend: missingDependency,
    onVerify: missingDependency,
    emailAddress: '',
    code: '',
    errorMessage: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'email',
          actions: assign(context => ({
            emailAddress: context.initialEmailAddress ?? '',
            code: '',
            errorMessage: undefined,
            resendSeconds: 0,
          })),
        },
      },
    },
    email: {
      on: {
        CANCEL: 'idle',
        TYPE_EMAIL: { actions: assign((_, event) => ({ emailAddress: event.value, errorMessage: undefined })) },
        SUBMIT: { target: 'sending', actions: assign(() => ({ errorMessage: undefined })) },
      },
    },
    sending: {
      invoke: fromPromise(context => context.onSend(context.emailAddress), {
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'email',
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
      invoke: fromPromise(context => context.onSend(context.emailAddress), {
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
      invoke: fromPromise(context => context.onVerify(context.emailAddress, context.code), {
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

export function useUserProfileAddEmailController(
  options: UserProfileAddEmailControllerOptions,
): UserProfileAddEmailViewProps {
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
        : 'email',
    emailAddress: snapshot.context.emailAddress,
    code: snapshot.context.code,
    errorMessage: snapshot.context.errorMessage,
    isPending: snapshot.value === 'sending' || snapshot.value === 'verifying',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onEmailAddressChange: value => send({ type: 'TYPE_EMAIL', value }),
    onCodeChange: value => send({ type: 'TYPE_CODE', value }),
    onSubmit: code => send({ type: 'SUBMIT', code }),
    onResend: () => send({ type: 'RESEND' }),
  };
}
