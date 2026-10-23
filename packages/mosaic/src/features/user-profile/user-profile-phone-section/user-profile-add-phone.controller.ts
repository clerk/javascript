import { useEffect, useMemo, useRef } from 'react';

import type { DialogHandle } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { useForm } from '../../../components/form';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import type { FormError } from '../../../utils/errors';
import { toFormError } from '../../../utils/errors';
import type { UserProfilePhone, UserProfilePhoneVerifier } from '../user-profile-contact.types';
import type { UserProfileAddPhoneDialogProps } from './user-profile-add-phone.dialog';

export type UserProfileAddPhoneField = 'phoneNumber' | 'code';

export interface UserProfileAddPhoneControllerOptions {
  onCreate?: (phoneNumber: string) => Promise<UserProfilePhoneVerifier>;
}

export interface UserProfileAddPhoneController extends UserProfileAddPhoneDialogProps {
  handle: DialogHandle<unknown>;
  verifyingId: string | undefined;
  onVerifyPhone: (phone: Pick<UserProfilePhone, 'id' | 'value'>, verifier: UserProfilePhoneVerifier) => Promise<void>;
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
  | { type: 'READY'; id?: string; phoneNumber: string; verifier: UserProfilePhoneVerifier }
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
const ready = {
  target: 'verify',
  actions: assign<Extract<Event, { type: 'READY' }>>((_, event) => ({
    verifyingId: event.id,
    phoneNumber: event.phoneNumber,
    verifier: event.verifier,
    error: undefined,
    resendSeconds: CODE_RESEND_SECONDS,
  })),
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
        READY: ready,
      },
    },
    phone: {
      on: { CANCEL: 'idle', READY: ready },
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
  const handle = useMemo(() => Dialog.createHandle(), []);
  const [snapshot, send, actor] = useMachine(machine);
  const created = useRef<{ value: string; verifier: UserProfilePhoneVerifier }>(undefined);
  const mounted = useRef(true);
  const generation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { resendSeconds, error } = snapshot.context;
  const phoneForm = useForm({
    initialValues: { phoneNumber: '' },
    onSubmit: async ({ phoneNumber }) => {
      if (onCreate) {
        if (created.current?.value !== phoneNumber) {
          const verifier = await onCreate(phoneNumber);
          if (!mounted.current) {
            return;
          }
          created.current = { value: phoneNumber, verifier };
        }
        const { verifier } = created.current;
        await verifier.sendCode();
        if (mounted.current) {
          send({ type: 'READY', phoneNumber, verifier });
        }
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
    handle,
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
      generation.current++;
      if (open) {
        created.current = undefined;
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
    onVerifyPhone: async (phone, verifier) => {
      if (actor.getSnapshot().value !== 'idle') {
        return;
      }
      const started = generation.current;
      await verifier.sendCode();
      if (mounted.current && generation.current === started && actor.getSnapshot().value === 'idle') {
        codeForm.reset();
        send({ type: 'READY', id: phone.id, phoneNumber: phone.value, verifier });
      }
    },
  };
}
