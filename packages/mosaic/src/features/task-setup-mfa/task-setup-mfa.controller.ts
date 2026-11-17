import { isReverificationCancelledError } from '@clerk/shared/error';
import { useEffect } from 'react';

import type { FlowDirection } from '../../components/flow';
import { usePendingAction } from '../../hooks/use-pending-action';
import { type ErrorDescription, fill, useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { downloadBackupCodes, printBackupCodes } from '../../utils/backup-codes';
import { toLocalizableError } from '../../utils/errors';
import { CODE_RESEND_SECONDS } from '../../utils/verification';
import type { SmsEnrollmentResult } from '../user-profile/user-profile-mfa-section/user-profile-mfa-section.types';
import type {
  AuthenticatorSetup,
  TaskSetupMfaMethod,
  TaskSetupMfaModel,
  TaskSetupMfaStep,
} from './task-setup-mfa.types';
import type { TaskSetupMfaViewProps } from './task-setup-mfa.view';

export type TaskSetupMfaReadyModel = Extract<TaskSetupMfaModel, { status: 'ready' }>;

type TaskAction = 'prepareAuthenticator' | 'verifyAuthenticator' | 'sms' | 'resend' | 'copy' | 'complete';

type SmsFlow = {
  kind: 'sms';
  step: 'select' | 'phone' | 'verify';
  origin: 'existing' | 'new';
  selectedPhoneId: string;
  phoneId?: string;
  phoneNumber: string;
  code: string;
  error?: ErrorDescription;
};

type TaskFlow =
  | { kind: 'start' }
  | { kind: 'select'; error?: ErrorDescription }
  | { kind: 'authenticator'; setup: AuthenticatorSetup; code: string; error?: ErrorDescription }
  | SmsFlow
  | {
      kind: 'success';
      method: TaskSetupMfaMethod;
      codes: readonly string[];
      copied: boolean;
      error?: ErrorDescription;
    };

type ResolvedFlow = Exclude<TaskFlow, { kind: 'start' }>;

interface TaskContext {
  flow: TaskFlow;
  initialFlow: ResolvedFlow;
  startsWithAuthenticator: boolean;
  direction: FlowDirection;
  savedSetup?: AuthenticatorSetup;
  pending?: TaskAction;
  resendSeconds: number;
  prepareAuthenticator: () => Promise<ResolvedFlow>;
  run: () => Promise<ResolvedFlow>;
}

type TaskEvent =
  | { type: 'SELECT_SMS'; flow: SmsFlow }
  | { type: 'RESUME_AUTHENTICATOR'; setup: AuthenticatorSetup }
  | { type: 'ADD_PHONE' }
  | { type: 'BACK'; hasPhones: boolean }
  | { type: 'EDIT_PHONE_ID'; value: string }
  | { type: 'EDIT_PHONE_NUMBER'; value: string }
  | { type: 'EDIT_CODE'; value: string }
  | { type: 'PRINT_FAILED' }
  | { type: 'TICK' }
  | { type: 'RUN'; key: TaskAction; run: () => Promise<ResolvedFlow> };

const { createMachine, assign, fromPromise } = setup<TaskContext, TaskEvent>();
const REVERIFIABLE_ACTIONS: readonly TaskAction[] = ['sms', 'prepareAuthenticator'];

function resolve(context: TaskContext): ResolvedFlow {
  return context.flow.kind === 'start' ? context.initialFlow : context.flow;
}

function smsFlow(phones: readonly { id: string }[]): SmsFlow {
  return {
    kind: 'sms',
    step: phones.length > 0 ? 'select' : 'phone',
    origin: phones.length > 0 ? 'existing' : 'new',
    selectedPhoneId: phones[0]?.id ?? '',
    phoneNumber: '',
    code: '',
  };
}

function withSms(context: TaskContext, update: (flow: SmsFlow) => SmsFlow): Partial<TaskContext> {
  const flow = resolve(context);
  return flow.kind === 'sms' ? { flow: update(flow) } : {};
}

function settle(context: TaskContext, output: ResolvedFlow): Partial<TaskContext> {
  const startsCountdown =
    context.pending === 'resend' || (context.pending === 'sms' && output.kind === 'sms' && output.step === 'verify');
  return {
    flow: output,
    direction: 1,
    savedSetup: output.kind === 'authenticator' ? output.setup : context.savedSetup,
    pending: undefined,
    resendSeconds: startsCountdown ? CODE_RESEND_SECONDS : context.resendSeconds,
  };
}

function fail(context: TaskContext, error: unknown): Partial<TaskContext> {
  const flow = resolve(context);
  if (isReverificationCancelledError(error)) {
    return { flow, pending: undefined };
  }
  return { flow: { ...flow, error: toLocalizableError(error) }, pending: undefined };
}

const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const taskSetupMfaMachine = createMachine({
  id: 'taskSetupMfa',
  initial: context => (context.startsWithAuthenticator ? 'preparing' : 'idle'),
  context: {
    flow: { kind: 'start' },
    initialFlow: { kind: 'select' },
    startsWithAuthenticator: false,
    direction: 1,
    resendSeconds: 0,
    prepareAuthenticator: () => Promise.resolve({ kind: 'select' }),
    run: () => Promise.resolve({ kind: 'select' }),
  },
  states: {
    preparing: {
      invoke: fromPromise(context => context.prepareAuthenticator(), {
        onDone: {
          target: 'idle',
          actions: assign<DoneInvokeEvent<ResolvedFlow>>((context, event) => settle(context, event.output)),
        },
        onError: { target: 'idle', actions: assign((context, event) => fail(context, event.error)) },
      }),
    },
    idle: {
      on: {
        TICK: tick,
        SELECT_SMS: { actions: assign((_, event) => ({ flow: event.flow, direction: 1 })) },
        RESUME_AUTHENTICATOR: {
          actions: assign((_, event) => ({
            flow: { kind: 'authenticator', setup: event.setup, code: '' },
            direction: 1,
          })),
        },
        ADD_PHONE: {
          actions: assign(context => ({
            ...withSms(context, flow => ({
              ...flow,
              step: 'phone',
              origin: 'new',
              phoneId: undefined,
              phoneNumber: '',
              code: '',
              error: undefined,
            })),
            direction: 1,
          })),
        },
        BACK: {
          actions: assign((context, event) => {
            const flow = resolve(context);
            if (flow.kind === 'sms' && flow.step === 'verify') {
              return {
                flow: { ...flow, step: flow.origin === 'new' ? 'phone' : 'select', code: '', error: undefined },
                direction: -1,
              };
            }
            if (flow.kind === 'sms' && flow.step === 'phone' && event.hasPhones) {
              return {
                flow: { ...flow, step: 'select', origin: 'existing', phoneId: undefined, error: undefined },
                direction: -1,
              };
            }
            return { flow: { kind: 'select' }, direction: -1 };
          }),
        },
        EDIT_PHONE_ID: {
          actions: assign((context, event) =>
            withSms(context, flow => ({
              ...flow,
              selectedPhoneId: event.value,
              phoneId: undefined,
              origin: 'existing',
            })),
          ),
        },
        EDIT_PHONE_NUMBER: {
          actions: assign((context, event) =>
            withSms(context, flow => ({
              ...flow,
              phoneNumber: event.value,
              phoneId: event.value === flow.phoneNumber ? flow.phoneId : undefined,
            })),
          ),
        },
        EDIT_CODE: {
          actions: assign((context, event) => {
            const flow = resolve(context);
            return flow.kind === 'sms' || flow.kind === 'authenticator' ? { flow: { ...flow, code: event.value } } : {};
          }),
        },
        PRINT_FAILED: {
          actions: assign(context => {
            const flow = resolve(context);
            return flow.kind === 'success' ? { flow: { ...flow, error: { code: 'mfa_print_unavailable' } } } : {};
          }),
        },
        RUN: {
          target: 'busy',
          actions: assign((context, event) => {
            const flow = resolve(context);
            return { flow: { ...flow, error: undefined }, pending: event.key, run: event.run };
          }),
        },
      },
    },
    busy: {
      on: { TICK: tick },
      invoke: fromPromise(context => context.run(), {
        onDone: {
          target: 'idle',
          actions: assign<DoneInvokeEvent<ResolvedFlow>>((context, event) => settle(context, event.output)),
        },
        onError: { target: 'idle', actions: assign((context, event) => fail(context, event.error)) },
      }),
    },
  },
});

function initialFlowFor(model: TaskSetupMfaReadyModel): ResolvedFlow {
  if (model.methods.length === 1 && model.methods[0] === 'sms') {
    return smsFlow(model.phones);
  }
  return { kind: 'select' };
}

function stepFor(flow: ResolvedFlow, reverifying: boolean): TaskSetupMfaStep {
  if (reverifying) {
    return 'verify';
  }
  return flow.kind;
}

export function useTaskSetupMfaController(model: TaskSetupMfaReadyModel): TaskSetupMfaViewProps {
  const errorText = useErrorText();
  const m = useMessages('taskSetupMfa').success;
  const signOut = usePendingAction<'signOut'>();
  const prepareAuthenticator = async (): Promise<ResolvedFlow> => {
    if (!model.createAuthenticator) {
      return { kind: 'select' };
    }
    const setup = await model.createAuthenticator();
    return { kind: 'authenticator', setup, code: '' };
  };
  const [{ context, value }, send] = useMachine(taskSetupMfaMachine, {
    context: {
      initialFlow: initialFlowFor(model),
      startsWithAuthenticator: model.methods.length === 1 && model.methods[0] === 'authenticator',
      prepareAuthenticator,
    },
  });
  const isBusy = value !== 'idle';
  const pending = value === 'preparing' ? 'prepareAuthenticator' : context.pending;
  const flow = resolve(context);
  const { resendSeconds } = context;
  const hasPhones = model.phones.length > 0;
  const fileValues = { applicationName: model.applicationName, identifier: model.identifier };

  useEffect(() => {
    if (resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds, send]);

  const run = (key: TaskAction, action: () => Promise<ResolvedFlow>) => {
    if (!isBusy) {
      send({ type: 'RUN', key, run: action });
    }
  };

  const reverification =
    [model.createPhoneReverification, model.enrollSmsReverification].find(controller => controller.visible) ??
    model.authenticatorReverification;
  const reverifying = pending !== undefined && REVERIFIABLE_ACTIONS.includes(pending) && reverification.visible;

  const select = (method: TaskSetupMfaMethod) => {
    if (isBusy) {
      return;
    }
    if (method === 'sms') {
      send({ type: 'SELECT_SMS', flow: smsFlow(model.phones) });
    } else if (context.savedSetup) {
      send({ type: 'RESUME_AUTHENTICATOR', setup: context.savedSetup });
    } else {
      run('prepareAuthenticator', prepareAuthenticator);
    }
  };

  const back = () => send({ type: 'BACK', hasPhones });

  const submitSms = (code?: string) => {
    const { enrollSms, enrollPhoneNumber } = model;
    if (!enrollSms || flow.kind !== 'sms') {
      return;
    }
    const current = flow;
    run('sms', async () => {
      const phoneId = current.step === 'phone' ? current.phoneId : (current.phoneId ?? current.selectedPhoneId);
      let result: SmsEnrollmentResult;
      if (phoneId) {
        result = await enrollSms(phoneId, code ?? (current.step === 'verify' ? current.code : undefined));
      } else if (current.step === 'phone' && enrollPhoneNumber) {
        result = await enrollPhoneNumber(current.phoneNumber);
      } else {
        return current;
      }
      if (result.status === 'needsVerification') {
        return {
          ...current,
          step: 'verify',
          phoneId: result.phone.id,
          phoneNumber: result.phone.phoneNumber,
          code: '',
          error: undefined,
        };
      }
      return { kind: 'success', method: 'sms', codes: result.backupCodes, copied: false };
    });
  };

  const resendSms = () => {
    const resend = model.resendSms;
    if (flow.kind !== 'sms' || !flow.phoneId || !resend || resendSeconds > 0) {
      return;
    }
    const current = flow;
    run('resend', async () => {
      await resend(current.phoneId ?? '');
      return { ...current, error: undefined };
    });
  };

  const verifyAuthenticator = (code: string) => {
    const verify = model.verifyAuthenticator;
    if (!verify || flow.kind !== 'authenticator') {
      return;
    }
    run('verifyAuthenticator', async () => {
      const result = await verify(code);
      return { kind: 'success', method: 'authenticator', codes: result.backupCodes, copied: false };
    });
  };

  const success = flow.kind === 'success' ? flow : undefined;

  const copy = () => {
    if (!success?.codes.length) {
      return;
    }
    const current = success;
    run('copy', async () => {
      await navigator.clipboard.writeText(current.codes.join('\n'));
      return { ...current, copied: true, error: undefined };
    });
  };

  const download = () => {
    if (!success?.codes.length) {
      return;
    }
    downloadBackupCodes({
      codes: success.codes,
      fileName: fill(m.fileName, fileValues),
      intro: fill(m.fileIntro, fileValues),
      instructions: m.fileInstructions,
    });
  };

  const print = () => {
    if (!success?.codes.length) {
      return;
    }
    if (!printBackupCodes({ codes: success.codes, title: fill(m.printTitle, fileValues) })) {
      send({ type: 'PRINT_FAILED' });
    }
  };

  const complete = () => {
    if (!success) {
      return;
    }
    const current = success;
    run('complete', async () => {
      await model.onComplete();
      return current;
    });
  };

  const errorMessage = 'error' in flow && flow.error ? errorText(flow.error) : undefined;
  const sms = flow.kind === 'sms' ? flow : undefined;
  const authenticator = flow.kind === 'authenticator' ? flow : undefined;

  return {
    step: stepFor(flow, reverifying),
    direction: context.direction,
    renderBranding: model.renderBranding,
    reverification,
    select: {
      methods: model.methods,
      pendingMethod: pending === 'prepareAuthenticator' ? 'authenticator' : undefined,
      errorMessage: flow.kind === 'select' ? errorMessage : undefined,
      onSelect: select,
    },
    sms: {
      step: sms?.step ?? 'select',
      direction: context.direction,
      phoneNumbers: model.phones,
      selectedPhoneId: sms?.selectedPhoneId ?? '',
      onSelectedPhoneIdChange: phoneId => send({ type: 'EDIT_PHONE_ID', value: phoneId }),
      onAddPhone: () => send({ type: 'ADD_PHONE' }),
      onBack: back,
      phoneNumber: sms?.phoneNumber ?? '',
      onPhoneNumberChange: phoneNumber => send({ type: 'EDIT_PHONE_NUMBER', value: phoneNumber }),
      code: sms?.code ?? '',
      onCodeChange: code => send({ type: 'EDIT_CODE', value: code }),
      onSubmit: submitSms,
      onResend: resendSms,
      isPending: pending === 'sms',
      isResending: pending === 'resend',
      resendSeconds,
      errorMessage: sms ? errorMessage : undefined,
    },
    authenticator: authenticator
      ? {
          setup: authenticator.setup,
          code: authenticator.code,
          onCodeChange: code => send({ type: 'EDIT_CODE', value: code }),
          onSubmit: verifyAuthenticator,
          onBack: back,
          isPending: pending === 'verifyAuthenticator',
          errorMessage,
        }
      : undefined,
    success: {
      method: success?.method ?? 'authenticator',
      codes: success?.codes ?? [],
      copied: success?.copied ?? false,
      onCopy: copy,
      onDownload: download,
      onPrint: print,
      onContinue: complete,
      pendingAction: pending === 'copy' || pending === 'complete' ? pending : undefined,
      errorMessage: success ? errorMessage : undefined,
    },
    signOut: {
      identifier: model.identifier,
      onSignOut: () => void signOut.run('signOut', model.onSignOut),
      isPending: signOut.isPending,
      errorMessage: signOut.error,
    },
  };
}
