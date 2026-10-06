import { useEffect } from 'react';

import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type { UserProfileAddEmailDialogProps } from './user-profile-add-email.dialog';

export interface UserProfileAddEmailControllerOptions {
  initialEmailAddress?: string;
  onSend: (emailAddress: string) => Promise<void>;
  onVerify: (emailAddress: string, code: string) => Promise<void>;
}

interface Context {
  emailAddress: string;
  code: string;
  error: unknown;
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

const base = setup<Context, Event>();
const { assign } = base;

function missingDependency(): Promise<void> {
  return Promise.reject(new Error('Add email callbacks are missing'));
}

function errorMessage(cause: unknown, fallback: string): string | undefined {
  if (cause === undefined) {
    return undefined;
  }
  return cause instanceof Error ? cause.message : fallback;
}

function openDialog(initialEmailAddress: string | undefined) {
  return assign(() => ({
    emailAddress: initialEmailAddress ?? '',
    code: '',
    error: undefined,
    resendSeconds: 0,
  }));
}

const { createMachine } = base.extend({
  actions: { open: openDialog(undefined) },
  actors: { send: missingDependency, verify: missingDependency },
});

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const machine = createMachine({
  id: 'addEmail',
  initial: 'idle',
  context: {
    emailAddress: '',
    code: '',
    error: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'email',
          actions: 'open',
        },
      },
    },
    email: {
      on: {
        CANCEL: 'idle',
        TYPE_EMAIL: { actions: assign((_, event) => ({ emailAddress: event.value, error: undefined })) },
        SUBMIT: { target: 'sending', actions: assign(() => ({ error: undefined })) },
      },
    },
    sending: {
      invoke: {
        src: 'send',
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'email',
          actions: assign((_, event) => ({ error: event.error })),
        },
      },
    },
    verify: {
      on: {
        CANCEL: 'idle',
        TICK: tick,
        RESEND: {
          target: 'resending',
          guard: context => context.resendSeconds === 0,
          actions: assign(() => ({ error: undefined })),
        },
        TYPE_CODE: { actions: assign((_, event) => ({ code: event.value, error: undefined })) },
        SUBMIT: {
          target: 'verifying',
          actions: assign((context, event) => ({ code: event.code ?? context.code, error: undefined })),
        },
      },
    },
    resending: {
      invoke: {
        src: 'send',
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'verify',
          actions: assign((_, event) => ({ error: event.error })),
        },
      },
    },
    verifying: {
      on: { TICK: tick },
      invoke: {
        src: 'verify',
        onDone: 'idle',
        onError: {
          target: 'verify',
          actions: assign((_, event) => ({ error: event.error })),
        },
      },
    },
  },
});

export function useUserProfileAddEmailController(
  options: UserProfileAddEmailControllerOptions,
): UserProfileAddEmailDialogProps {
  const m = useMessages('userProfileAddEmail');
  const [snapshot, send] = useMachine(
    machine.provide({
      actions: { open: openDialog(options.initialEmailAddress) },
      actors: {
        send: context => options.onSend(context.emailAddress),
        verify: context => options.onVerify(context.emailAddress, context.code),
      },
    }),
  );
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
    errorMessage: errorMessage(snapshot.context.error, m.error),
    isPending: snapshot.value === 'sending' || snapshot.value === 'verifying',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onEmailAddressChange: value => send({ type: 'TYPE_EMAIL', value }),
    onCodeChange: value => send({ type: 'TYPE_CODE', value }),
    onSubmit: code => send({ type: 'SUBMIT', code }),
    onResend: () => send({ type: 'RESEND' }),
  };
}
