import { useEffect, useMemo, useRef } from 'react';

import type { DialogHandle } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { useForm } from '../../../components/form';
import { useErrorText } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { DoneInvokeEvent, ErrorInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import type { FormError } from '../../../utils/errors';
import { toFormError } from '../../../utils/errors';
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
  onVerifyEmail: (email: Pick<UserProfileEmail, 'id' | 'value'>, verifier: UserProfileEmailVerifier) => Promise<void>;
}

interface Context {
  verifyingId: string | undefined;
  emailAddress: string;
  verifier: UserProfileEmailVerifier | undefined;
  verification: UserProfileEmailVerification | undefined;
  error: FormError | undefined;
  resendSeconds: number;
}

type Event =
  | { type: 'ADD' }
  | {
      type: 'READY';
      id?: string;
      emailAddress: string;
      verifier: UserProfileEmailVerifier;
      verification: UserProfileEmailVerification;
    }
  | { type: 'VERIFIED' }
  | { type: 'CANCEL' }
  | { type: 'CONNECT' }
  | { type: 'RESEND' }
  | { type: 'TICK' };

const { createMachine, assign, fromPromise } = setup<Context, Event>();

function missingDependency(): Promise<never> {
  return Promise.reject(new Error('Email verification is missing'));
}

const CODE_RESEND_SECONDS = 30;
const LINK_RESEND_SECONDS = 60;

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };
const fail = assign<ErrorInvokeEvent>((_, event) => ({ error: toFormError(event.error) }));
const resend = {
  target: 'resending',
  guard: (context: Context) => context.resendSeconds === 0,
  actions: assign(() => ({ error: undefined })),
};
const ready = {
  target: 'ready',
  actions: assign<Extract<Event, { type: 'READY' }>>((_, event) => ({
    verifyingId: event.id,
    emailAddress: event.emailAddress,
    verifier: event.verifier,
    verification: event.verification,
    error: undefined,
    resendSeconds:
      event.verification.method === 'link'
        ? LINK_RESEND_SECONDS
        : event.verification.method === 'code'
          ? CODE_RESEND_SECONDS
          : 0,
  })),
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
        READY: ready,
      },
    },
    email: {
      on: { CANCEL: 'idle', READY: ready },
    },
    ready: {
      always: ({ context }) => ({
        target:
          context.verification?.method === 'code'
            ? 'verify'
            : context.verification?.method === 'sso'
              ? 'connecting'
              : 'waiting',
      }),
    },
    resending: {
      on: { CANCEL: { target: 'idle', guard: context => context.verification?.method === 'link' } },
      invoke: fromPromise(context => (context.verifier ? context.verifier.prepare() : missingDependency()), {
        onDone: {
          target: 'ready',
          actions: assign<DoneInvokeEvent<UserProfileEmailVerification>>((_, event) => ({
            verification: event.output,
            resendSeconds: event.output.method === 'link' ? LINK_RESEND_SECONDS : CODE_RESEND_SECONDS,
          })),
        },
        onError: [
          { target: 'linkFailed', guard: context => context.verification?.method === 'link', actions: fail },
          { target: 'verify', actions: fail },
        ],
      }),
    },
    waiting: {
      on: { CANCEL: 'idle', TICK: tick, RESEND: resend },
      invoke: fromPromise(
        context => (context.verification?.method === 'link' ? context.verification.verified : missingDependency()),
        {
          onDone: 'idle',
          onError: { target: 'linkFailed', actions: fail },
        },
      ),
    },
    linkFailed: {
      on: { CANCEL: 'idle', TICK: tick, RESEND: resend },
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

const CODE_LENGTH = 6;

export function useUserProfileAddEmailController({
  initialEmailAddress = '',
  username,
  onCreate,
  reverification,
}: UserProfileAddEmailControllerOptions): UserProfileAddEmailController {
  const errorText = useErrorText();
  const handle = useMemo(() => Dialog.createHandle(), []);
  const [snapshot, send, actor] = useMachine(machine);
  const activeVerifier = useRef<UserProfileEmailVerifier>(undefined);
  const created = useRef<{ value: string; verifier: UserProfileEmailVerifier }>(undefined);
  const generation = useRef(0);
  useEffect(() => {
    return () => {
      activeVerifier.current?.cancel();
    };
  }, []);
  const { resendSeconds, error, verification } = snapshot.context;
  const emailForm = useForm({
    initialValues: { emailAddress: initialEmailAddress },
    canSubmit: values => values.emailAddress !== '' && values.emailAddress !== username,
    onSubmit: async ({ emailAddress }) => {
      if (onCreate) {
        if (created.current?.value !== emailAddress) {
          const verifier = await onCreate(emailAddress);
          if (actor.getSnapshot().status !== 'active') {
            return;
          }
          created.current = { value: emailAddress, verifier };
        }
        const { verifier } = created.current;
        activeVerifier.current = verifier;
        const verification = await verifier.prepare();
        if (actor.getSnapshot().status === 'active') {
          send({ type: 'READY', emailAddress, verifier, verification });
        }
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
  const open = state !== 'idle';
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
    isResending: state === 'resending',
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
      if (actor.getSnapshot().value === 'resending' && verification?.method !== 'link') {
        return;
      }
      generation.current++;
      if (open) {
        created.current = undefined;
        emailForm.reset();
        codeForm.reset();
        send({ type: 'ADD' });
      } else {
        activeVerifier.current?.cancel();
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
    onVerifyEmail: async (email, verifier) => {
      if (actor.getSnapshot().value !== 'idle') {
        return;
      }
      const started = generation.current;
      activeVerifier.current = verifier;
      const verification = await verifier.prepare();
      if (
        actor.getSnapshot().status === 'active' &&
        generation.current === started &&
        actor.getSnapshot().value === 'idle'
      ) {
        codeForm.reset();
        send({ type: 'READY', id: email.id, emailAddress: email.value, verifier, verification });
      } else {
        verifier.cancel();
      }
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
