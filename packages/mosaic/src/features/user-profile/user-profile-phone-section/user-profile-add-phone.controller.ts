import { useEffect, useMemo } from 'react';

import type { DialogHandle } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { useForm } from '../../../components/form';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import type { FormError } from '../../../utils/errors';
import { toFormError } from '../../../utils/errors';
import { CODE_RESEND_SECONDS } from '../../../utils/verification';
import type { ReverificationController } from '../../reverification';
import type { UserProfilePhone, UserProfilePhoneVerifier } from '../user-profile-contact.types';
import type { UserProfileAddPhoneDialogProps } from './user-profile-add-phone.dialog';

export type UserProfileAddPhoneField = 'phoneNumber' | 'code';

export interface UserProfileAddPhoneControllerOptions {
  onCreate?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
  reverification?: ReverificationController;
}

export interface UserProfileAddPhoneController extends UserProfileAddPhoneDialogProps {
  handle: DialogHandle<unknown>;
  verifyingId: string | undefined;
  pendingVerifyId: string | undefined;
  onVerifyPhone: (phone: Pick<UserProfilePhone, 'id' | 'value'>, verifier: UserProfilePhoneVerifier) => void;
}

interface Context {
  verifyingId: string | undefined;
  phoneNumber: string;
  verifier: UserProfilePhoneVerifier | undefined;
  error: FormError | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'ADD' }
  | { type: 'START'; id?: string; phoneNumber: string; verifier: UserProfilePhoneVerifier }
  | { type: 'VERIFIED' }
  | { type: 'CANCEL' }
  | { type: 'RESEND' }
  | { type: 'TICK' };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Phone verification is missing'));
}

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };
const fail = assign<ErrorInvokeEvent>((_, event) => ({ error: toFormError(event.error) }));
const start = {
  target: 'sending',
  actions: assign<Extract<Event, { type: 'START' }>>((_, event) => ({
    verifyingId: event.id,
    phoneNumber: event.phoneNumber,
    verifier: event.verifier,
    error: undefined,
    resendSeconds: 0,
  })),
};

const sendCode = {
  invoke: fromPromise((context: Context) => (context.verifier ? context.verifier.sendCode() : missingDependency()), {
    onDone: { target: 'verify', actions: assign(() => ({ resendSeconds: CODE_RESEND_SECONDS })) },
    onError: { target: 'verify', actions: fail },
  }),
};

const machine = createMachine({
  id: 'addPhone',
  initial: 'idle',
  context: {
    verifyingId: undefined,
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
          actions: assign(() => ({ verifyingId: undefined, verifier: undefined, error: undefined, resendSeconds: 0 })),
        },
        START: { ...start, target: 'preparing' },
      },
    },
    phone: {
      on: { CANCEL: 'idle', START: start },
    },
    preparing: sendCode,
    sending: sendCode,
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
  reverification,
}: UserProfileAddPhoneControllerOptions): UserProfileAddPhoneController {
  const errorText = useErrorText();
  const handle = useMemo(() => Dialog.createHandle(), []);
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
  const open = state !== 'idle' && state !== 'preparing';
  useEffect(() => {
    if (!open || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [open, resendSeconds, send]);

  const isReverifying = phoneForm.isSubmitting && Boolean(reverification?.visible);
  const step = isReverifying ? 'reverify' : state === 'phone' ? 'phone' : 'verify';
  const form = state === 'phone' ? phoneForm : codeForm;
  const formError = state === 'phone' ? phoneForm.fields.phoneNumber.feedback : codeForm.fields.code.feedback;
  const machineError = error?.global ? errorText(error.global) : undefined;

  return {
    handle,
    resendSeconds,
    isResending: state === 'sending',
    open,
    step,
    reverification,
    phoneNumber: state === 'phone' ? phoneForm.values.phoneNumber : snapshot.context.phoneNumber,
    code: codeForm.values.code,
    errorMessage: formError?.message ?? form.error ?? machineError,
    isPending: form.isSubmitting,
    onOpenChange: open => {
      if (form.isSubmitting) {
        if (open || state !== 'phone' || !reverification?.onCancel) {
          return;
        }
        reverification.onCancel();
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
    verifyingId: snapshot.context.verifyingId,
    pendingVerifyId: state === 'preparing' ? snapshot.context.verifyingId : undefined,
    onVerifyPhone: (phone, verifier) => {
      codeForm.reset();
      send({ type: 'START', id: phone.id, phoneNumber: phone.value, verifier });
    },
  };
}
