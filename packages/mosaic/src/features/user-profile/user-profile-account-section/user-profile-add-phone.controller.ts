import { useEffect } from 'react';

import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type { UserProfileAddPhoneDialogProps } from './user-profile-add-phone.dialog';

export interface UserProfileAddPhoneControllerOptions {
  initialPhoneNumber?: string;
  onSend: (phoneNumber: string) => Promise<void>;
  onVerify: (phoneNumber: string, code: string) => Promise<void>;
}

interface Context {
  phoneNumber: string;
  code: string;
  error: unknown;
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

const base = setup<Context, Event>();
const { assign } = base;

function missingDependency(): Promise<void> {
  return Promise.reject(new Error('Add phone callbacks are missing'));
}

function errorMessage(cause: unknown, fallback: string): string | undefined {
  if (cause === undefined) {
    return undefined;
  }
  return cause instanceof Error ? cause.message : fallback;
}

function openDialog(initialPhoneNumber: string | undefined) {
  return assign(() => ({
    phoneNumber: initialPhoneNumber ?? '',
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
  id: 'addPhone',
  initial: 'idle',
  context: {
    phoneNumber: '',
    code: '',
    error: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: 'phone',
          actions: 'open',
        },
      },
    },
    phone: {
      on: {
        CANCEL: 'idle',
        TYPE_PHONE: { actions: assign((_, event) => ({ phoneNumber: event.value, error: undefined })) },
        SUBMIT: { target: 'sending', actions: assign(() => ({ error: undefined })) },
      },
    },
    sending: {
      invoke: {
        src: 'send',
        onDone: { target: 'verify', actions: assign(() => ({ code: '', resendSeconds: 12 })) },
        onError: {
          target: 'phone',
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

export function useUserProfileAddPhoneController(
  options: UserProfileAddPhoneControllerOptions,
): UserProfileAddPhoneDialogProps {
  const m = useMessages('userProfileAddPhone');
  const [snapshot, send] = useMachine(
    machine.provide({
      actions: { open: openDialog(options.initialPhoneNumber) },
      actors: {
        send: context => options.onSend(context.phoneNumber),
        verify: context => options.onVerify(context.phoneNumber, context.code),
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
        : 'phone',
    phoneNumber: snapshot.context.phoneNumber,
    code: snapshot.context.code,
    errorMessage: errorMessage(snapshot.context.error, m.error),
    isPending: snapshot.value === 'sending' || snapshot.value === 'verifying',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onPhoneNumberChange: value => send({ type: 'TYPE_PHONE', value }),
    onCodeChange: value => send({ type: 'TYPE_CODE', value }),
    onSubmit: code => send({ type: 'SUBMIT', code }),
    onResend: () => send({ type: 'RESEND' }),
  };
}
