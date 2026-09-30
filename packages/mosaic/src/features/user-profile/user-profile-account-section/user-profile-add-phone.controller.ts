import { useEffect } from 'react';

import { useForm } from '../../../components/form';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/useMachine';
import type { FormError } from '../../../utils/form-error';
import { toFormError } from '../../../utils/form-error';
import type { UserProfilePhoneVerifier } from './user-profile-account-section.types';
import type { UserProfileAddPhoneDialogProps } from './user-profile-add-phone.dialog';

export type UserProfileAddPhoneField = 'phoneNumber' | 'code';

export interface UserProfileAddPhoneControllerOptions {
  onCreate?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
}

export interface UserProfileAddPhoneController extends UserProfileAddPhoneDialogProps {
  onVerifyPhone: (phoneNumber: string, verifier: UserProfilePhoneVerifier) => void;
}

interface Context {
  phoneNumber: string;
  verifier: UserProfilePhoneVerifier | undefined;
  error: FormError | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'ADD' }
  | { type: 'START'; phoneNumber: string; verifier: UserProfilePhoneVerifier }
  | { type: 'VERIFIED' }
  | { type: 'CANCEL' }
  | { type: 'RESEND' }
  | { type: 'TICK' };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Phone verification is missing'));
}

const CODE_RESEND_SECONDS = 30;

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };
const fail = assign<ErrorInvokeEvent>((_, event) => ({ error: toFormError(event.error) }));
const start = {
  target: 'sending',
  actions: assign<Extract<Event, { type: 'START' }>>((_, event) => ({
    phoneNumber: event.phoneNumber,
    verifier: event.verifier,
    error: undefined,
    resendSeconds: 0,
  })),
};

const machine = createMachine({
  id: 'addPhone',
  initial: 'idle',
  context: {
    phoneNumber: '',
    verifier: undefined,
    error: undefined,
    resendSeconds: 0,
  },
  states: {
    idle: {
      on: {
        ADD: {
          target: 'phone',
          actions: assign(() => ({ verifier: undefined, error: undefined, resendSeconds: 0 })),
        },
        START: start,
      },
    },
    phone: {
      on: { CANCEL: 'idle', START: start },
    },
    sending: {
      invoke: fromPromise(context => (context.verifier ? context.verifier.sendCode() : missingDependency()), {
        onDone: { target: 'verify', actions: assign(() => ({ resendSeconds: CODE_RESEND_SECONDS })) },
        onError: { target: 'verify', actions: fail },
      }),
    },
    verify: {
      on: {
        CANCEL: 'idle',
        TICK: tick,
        VERIFIED: 'idle',
        RESEND: {
          target: 'sending',
          guard: context => context.resendSeconds === 0,
          actions: assign(() => ({ error: undefined })),
        },
      },
    },
  },
});

export function useUserProfileAddPhoneController({
  onCreate,
}: UserProfileAddPhoneControllerOptions): UserProfileAddPhoneController {
  const errorText = useErrorText();
  const [snapshot, send, actor] = useMachine(machine);
  const { resendSeconds, error } = snapshot.context;
  const phoneForm = useForm({
    initialValues: { phoneNumber: '' },
    onSubmit: async ({ phoneNumber }) => {
      if (onCreate) {
        send({ type: 'START', phoneNumber, verifier: await onCreate(phoneNumber) });
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

  const step = state === 'phone' ? 'phone' : 'verify';
  const form = step === 'phone' ? phoneForm : codeForm;
  const formError = step === 'phone' ? phoneForm.fields.phoneNumber.feedback : codeForm.fields.code.feedback;
  const machineError = error?.global ? errorText(error.global) : undefined;

  return {
    resendSeconds,
    isResending: state === 'sending',
    open,
    step,
    phoneNumber: step === 'phone' ? phoneForm.values.phoneNumber : snapshot.context.phoneNumber,
    code: codeForm.values.code,
    errorMessage: formError?.message ?? form.error ?? machineError,
    isPending: form.isSubmitting,
    onOpenChange: open => {
      if (form.isSubmitting) {
        return;
      }
      if (open) {
        phoneForm.reset();
        codeForm.reset();
        send({ type: 'ADD' });
      } else {
        send({ type: 'CANCEL' });
      }
    },
    onPhoneNumberChange: value => phoneForm.setValue('phoneNumber', value),
    onCodeChange: value => codeForm.setValue('code', value),
    onSubmit: code => {
      const state = actor.getSnapshot().value;
      if (state === 'phone') {
        phoneForm.submit();
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
    onVerifyPhone: (phoneNumber, verifier) => {
      codeForm.reset();
      send({ type: 'START', phoneNumber, verifier });
    },
  };
}
