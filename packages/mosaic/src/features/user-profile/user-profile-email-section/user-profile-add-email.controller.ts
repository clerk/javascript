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
import { CODE_LENGTH, CODE_RESEND_SECONDS } from '../../../utils/verification';
import type { ReverificationController } from '../../reverification';
import type {
  UserProfileEmail,
  UserProfileEmailVerification,
  UserProfileEmailVerifier,
} from '../user-profile-contact.types';
import type { UserProfileAddEmailDialogProps } from './user-profile-add-email.dialog';

export type UserProfileAddEmailField = 'emailAddress' | 'code';

export interface UserProfileAddEmailControllerOptions {
  initialEmailAddress?: string;
  username?: string;
  onCreate?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
  reverification: ReverificationController;
}

export interface UserProfileAddEmailController extends UserProfileAddEmailDialogProps {
  handle: DialogHandle<unknown>;
  verifyingId: string | undefined;
  pendingVerifyId: string | undefined;
  onVerifyEmail: (email: Pick<UserProfileEmail, 'id' | 'value'>, verifier: UserProfileEmailVerifier) => void;
}

interface Context {
  verifyingId: string | undefined;
  emailAddress: string;
  verifier: UserProfileEmailVerifier | undefined;
  verification: UserProfileEmailVerification | undefined;
  error: FormError | undefined;
  resendSeconds: number;
  held: boolean;
}

type Event =
  | { type: 'ADD' }
  | { type: 'START'; id?: string; emailAddress: string; verifier: UserProfileEmailVerifier }
  | { type: 'VERIFIED' }
  | { type: 'CANCEL' }
  | { type: 'CONNECT' }
  | { type: 'RESEND' }
  | { type: 'TICK' };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Email verification is missing'));
}

const LINK_RESEND_SECONDS = 60;

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };
const fail = assign<ErrorInvokeEvent>((_, event) => ({ error: toFormError(event.error) }));
const resend = {
  target: 'starting',
  guard: (context: Context) => context.resendSeconds === 0,
  actions: assign(() => ({ error: undefined })),
};
const start = {
  target: 'starting',
  actions: assign<Extract<Event, { type: 'START' }>>((_, event) => ({
    verifyingId: event.id,
    emailAddress: event.emailAddress,
    verifier: event.verifier,
    verification: undefined,
    error: undefined,
    resendSeconds: 0,
    held: false,
  })),
};

const sendCode = {
  invoke: fromPromise(
    (context: Context) => (context.verification?.method === 'code' ? context.verification.sent : missingDependency()),
    {
      onDone: { target: 'verify', actions: assign(() => ({ resendSeconds: CODE_RESEND_SECONDS, held: false })) },
      onError: { target: 'verify', actions: [fail, assign(() => ({ held: false }))] },
    },
  ),
};

const machine = createMachine({
  id: 'addEmail',
  initial: 'idle',
  context: {
    verifyingId: undefined,
    emailAddress: '',
    verifier: undefined,
    verification: undefined,
    error: undefined,
    resendSeconds: 0,
    held: false,
  },
  states: {
    idle: {
      on: {
        ADD: {
          target: 'email',
          actions: assign(() => ({
            verifyingId: undefined,
            verifier: undefined,
            verification: undefined,
            error: undefined,
            resendSeconds: 0,
          })),
        },
        START: { ...start, actions: [start.actions, assign(() => ({ held: true }))] },
      },
    },
    email: {
      on: { CANCEL: 'idle', START: start },
    },
    starting: {
      entry: assign(context => ({
        verification: context.verifier ? context.verifier.start() : undefined,
        error: undefined,
      })),
      always: ({ context }) => {
        const method = context.verification?.method;
        if (method === 'code') {
          return { target: context.held ? 'preparing' : 'sending' };
        }
        if (method === 'sso') {
          return { target: 'connecting' };
        }
        return { target: 'waiting', context: { resendSeconds: method === 'link' ? LINK_RESEND_SECONDS : 0 } };
      },
    },
    preparing: sendCode,
    sending: sendCode,
    waiting: {
      on: { CANCEL: 'idle', TICK: tick, RESEND: resend },
      invoke: fromPromise(
        context => (context.verification?.method === 'link' ? context.verification.verified : missingDependency()),
        {
          onDone: 'idle',
          onError: { actions: fail },
        },
      ),
    },
    connecting: {
      on: { CANCEL: 'idle', CONNECT: 'redirecting' },
    },
    redirecting: {
      invoke: fromPromise(
        context => (context.verification?.method === 'sso' ? context.verification.connect() : missingDependency()),
        {
          onDone: 'connecting',
          onError: { target: 'connecting', actions: fail },
        },
      ),
    },
    verify: {
      on: { CANCEL: 'idle', TICK: tick, RESEND: resend, VERIFIED: 'idle' },
    },
  },
});

export function useUserProfileAddEmailController({
  initialEmailAddress = '',
  username,
  onCreate,
  reverification,
}: UserProfileAddEmailControllerOptions): UserProfileAddEmailController {
  const errorText = useErrorText();
  const handle = useMemo(() => Dialog.createHandle(), []);
  const [snapshot, send, actor] = useMachine(machine);
  const { resendSeconds, error, verification } = snapshot.context;
  const emailForm = useForm({
    initialValues: { emailAddress: initialEmailAddress },
    canSubmit: values => values.emailAddress !== '' && values.emailAddress !== username,
    onSubmit: async ({ emailAddress }) => {
      if (onCreate) {
        send({ type: 'START', emailAddress, verifier: await onCreate(emailAddress) });
      }
    },
  });
  const codeForm = useForm({
    initialValues: { code: '' },
    canSubmit: values => values.code.length === CODE_LENGTH,
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
  const waitingFor = state === 'waiting' && verification?.method === 'link' ? verification : undefined;
  useEffect(() => waitingFor?.cancel, [waitingFor]);
  useEffect(() => {
    if (!open || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [open, resendSeconds, send]);

  const isReverifying = emailForm.isSubmitting && reverification.visible;
  const step = isReverifying ? 'reverify' : toStep(state, verification);
  const form = state === 'email' ? emailForm : codeForm;
  const formError = state === 'email' ? emailForm.fields.emailAddress.feedback : codeForm.fields.code.feedback;
  const machineError = error?.global ? errorText(error.global) : undefined;

  return {
    handle,
    resendSeconds,
    isResending: state === 'sending',
    open,
    step,
    reverification,
    emailAddress: state === 'email' ? emailForm.values.emailAddress : snapshot.context.emailAddress,
    canSubmitEmail: emailForm.canSubmit || emailForm.isSubmitting,
    code: codeForm.values.code,
    canSubmitCode: codeForm.canSubmit || codeForm.isSubmitting,
    errorMessage: formError?.message ?? form.error ?? machineError,
    isPending: form.isSubmitting || state === 'redirecting',
    onOpenChange: open => {
      if (form.isSubmitting) {
        if (open || state !== 'email' || !reverification.onCancel) {
          return;
        }
        reverification.onCancel();
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
    onConnect: () => send({ type: 'CONNECT' }),
    verifyingId: snapshot.context.verifyingId,
    pendingVerifyId: state === 'preparing' ? snapshot.context.verifyingId : undefined,
    onVerifyEmail: (email, verifier) => {
      codeForm.reset();
      send({ type: 'START', id: email.id, emailAddress: email.value, verifier });
    },
  };
}

function toStep(
  state: string,
  verification: UserProfileEmailVerification | undefined,
): Exclude<UserProfileAddEmailDialogProps['step'], 'reverify'> {
  if (state === 'email') {
    return 'email';
  }
  return verification && verification.method !== 'code' ? verification.method : 'verify';
}
