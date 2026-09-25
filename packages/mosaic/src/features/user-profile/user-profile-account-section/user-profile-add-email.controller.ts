import { useEffect } from 'react';

import { useForm } from '../../../components/form';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/useMachine';
import type { FormError } from '../../../utils/form-error';
import { toFormError } from '../../../utils/form-error';
import type { UserProfileEmailVerifier } from './user-profile-account-section.types';
import type { UserProfileAddEmailDialogProps } from './user-profile-add-email.dialog';

export type UserProfileAddEmailField = 'emailAddress' | 'code';

export interface UserProfileAddEmailControllerOptions {
  initialEmailAddress?: string;
  onCreate?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
}

export interface UserProfileAddEmailController extends UserProfileAddEmailDialogProps {
  onVerifyEmail: (emailAddress: string, verifier: UserProfileEmailVerifier) => void;
}

interface Context {
  emailAddress: string;
  verifier: UserProfileEmailVerifier | undefined;
  error: FormError | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'ADD' }
  | { type: 'START'; emailAddress: string; verifier: UserProfileEmailVerifier }
  | { type: 'VERIFIED' }
  | { type: 'CANCEL' }
  | { type: 'RESEND' }
  | { type: 'TICK' };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Email verification is missing'));
}

const CODE_RESEND_SECONDS = 12;

const start = {
  target: 'sending',
  actions: assign<Extract<Event, { type: 'START' }>>((_, event) => ({
    emailAddress: event.emailAddress,
    verifier: event.verifier,
    error: undefined,
    resendSeconds: 0,
  })),
};

const machine = createMachine({
  id: 'addEmail',
  initial: 'idle',
  context: {
    emailAddress: '',
    verifier: undefined,
    error: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        ADD: {
          target: 'email',
          actions: assign(() => ({ verifier: undefined, error: undefined, resendSeconds: 0 })),
        },
        START: start,
      },
    },
    email: {
      on: { CANCEL: 'idle', START: start },
    },
    sending: {
      invoke: fromPromise(context => (context.verifier ? context.verifier.start().sent : missingDependency()), {
        onDone: { target: 'verify', actions: assign(() => ({ resendSeconds: CODE_RESEND_SECONDS })) },
        onError: {
          target: 'verify',
          actions: assign<ErrorInvokeEvent>((_, event) => ({ error: toFormError(event.error) })),
        },
      }),
    },
    verify: {
      on: {
        CANCEL: 'idle',
        TICK: { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) },
        RESEND: {
          target: 'sending',
          guard: context => context.resendSeconds === 0,
          actions: assign(() => ({ error: undefined })),
        },
        VERIFIED: 'idle',
      },
    },
  },
});

export function useUserProfileAddEmailController({
  initialEmailAddress = '',
  onCreate,
}: UserProfileAddEmailControllerOptions): UserProfileAddEmailController {
  const errorText = useErrorText();
  const [snapshot, send, actor] = useMachine(machine);
  const { resendSeconds, error } = snapshot.context;
  const emailForm = useForm({
    initialValues: { emailAddress: initialEmailAddress },
    onSubmit: async ({ emailAddress }) => {
      if (onCreate) {
        send({ type: 'START', emailAddress, verifier: await onCreate(emailAddress) });
      }
    },
  });
  const codeForm = useForm({
    initialValues: { code: '' },
    onSubmit: async ({ code }) => {
      const { verifier } = actor.getSnapshot().context;
      if (verifier) {
        await verifier.verifyCode(code);
        send({ type: 'VERIFIED' });
      }
    },
  });
  const state = snapshot.value;
  const open = state !== 'idle';
  useEffect(() => {
    if (!open || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [open, resendSeconds, send]);

  const step = state === 'email' ? 'email' : 'verify';
  const form = step === 'email' ? emailForm : codeForm;
  const formError = step === 'email' ? emailForm.fields.emailAddress.feedback : codeForm.fields.code.feedback;
  const machineError = error?.global ? errorText(error.global) : undefined;

  return {
    resendSeconds,
    isResending: state === 'sending',
    open,
    step,
    emailAddress: step === 'email' ? emailForm.values.emailAddress : snapshot.context.emailAddress,
    canSubmitEmail: emailForm.canSubmit || emailForm.isSubmitting,
    code: codeForm.values.code,
    errorMessage: formError?.message ?? form.error ?? machineError,
    isPending: form.isSubmitting,
    onOpenChange: open => {
      if (form.isSubmitting) {
        return;
      }
      if (open) {
        emailForm.reset();
        codeForm.reset();
        send({ type: 'ADD' });
      } else {
        send({ type: 'CANCEL' });
      }
    },
    onEmailAddressChange: value => emailForm.setValue('emailAddress', value),
    onCodeChange: value => codeForm.setValue('code', value),
    onSubmit: code => {
      const state = actor.getSnapshot().value;
      if (state === 'email') {
        emailForm.submit();
      } else if (state === 'verify') {
        if (code !== undefined) {
          codeForm.setValue('code', code);
        }
        codeForm.submit();
      }
    },
    onResend: () => {
      if (!codeForm.isSubmitting && actor.can({ type: 'RESEND' })) {
        codeForm.reset();
        send({ type: 'RESEND' });
      }
    },
    onVerifyEmail: (emailAddress, verifier) => {
      codeForm.reset();
      send({ type: 'START', emailAddress, verifier });
    },
  };
}
