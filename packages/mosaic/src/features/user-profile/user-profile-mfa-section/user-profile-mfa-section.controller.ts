import { isReverificationCancelledError } from '@clerk/shared/error';
import { useEffect } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { type ErrorDescription, fill, type MosaicMessages, useErrorText, useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { DoneInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/errors';
import type { ReverificationController } from '../../reverification';
import type {
  SmsEnrollmentResult,
  UserProfileMfaAddableMethod,
  UserProfileMfaModel,
} from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';
import type { UserProfileMfaSetupViewProps } from './user-profile-mfa-setup.view';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;
type AuthenticatorSetup = { secret: string; uri: string };
type MfaAction = 'prepareAuthenticator' | 'verifyAuthenticator' | 'sms' | 'resend' | 'generate' | 'copy';
type MfaFlow =
  | { kind: 'closed'; error?: ErrorDescription }
  | { kind: 'select'; error?: ErrorDescription }
  | {
      kind: 'authenticator';
      setup: AuthenticatorSetup;
      code: string;
      error?: ErrorDescription;
    }
  | {
      kind: 'sms';
      step: 'select' | 'phone' | 'verify';
      origin: 'existing' | 'new';
      selectedPhoneId: string;
      phoneId?: string;
      phoneNumber: string;
      code: string;
      error?: ErrorDescription;
    }
  | { kind: 'backup'; codes: readonly string[]; error?: ErrorDescription };

interface MfaContext {
  flow: MfaFlow;
  savedSetup?: AuthenticatorSetup;
  pending?: MfaAction;
  pendingMethods: readonly UserProfileMfaAddableMethod[];
  dismissed: boolean;
  resendSeconds: number;
  run: () => Promise<MfaFlow>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

type MfaEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SELECT_SMS'; phoneId: string; hasPhones: boolean }
  | { type: 'RESUME_AUTHENTICATOR'; setup: AuthenticatorSetup }
  | { type: 'ADD_PHONE' }
  | { type: 'BACK'; hasPhones: boolean }
  | { type: 'EDIT_PHONE_ID'; value: string }
  | { type: 'EDIT_PHONE_NUMBER'; value: string }
  | { type: 'EDIT_CODE'; value: string }
  | { type: 'PRINT_FAILED' }
  | { type: 'TICK' }
  | {
      type: 'RUN';
      key: MfaAction;
      methods: readonly UserProfileMfaAddableMethod[];
      run: () => Promise<MfaFlow>;
      resolve: () => void;
      reject: (error: unknown) => void;
    };

const { createMachine, assign, fromPromise } = setup<MfaContext, MfaEvent>();
const RESEND_COOLDOWN_SECONDS = 30;
const REVERIFIABLE_ACTIONS: readonly MfaAction[] = ['generate', 'sms', 'prepareAuthenticator'];
const PENDING_METHODS: Partial<Record<MfaAction, NonNullable<UserProfileMfaSetupViewProps['pendingMethod']>>> = {
  prepareAuthenticator: 'authenticator',
  generate: 'backup-codes',
};
const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const mfaMachine = createMachine({
  id: 'userProfileMfa',
  initial: 'idle',
  context: {
    flow: { kind: 'closed' },
    dismissed: false,
    resendSeconds: 0,
    pendingMethods: [],
    run: () => Promise.resolve({ kind: 'closed' }),
    resolve: () => undefined,
    reject: () => undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: { actions: assign(() => ({ flow: { kind: 'select' } })) },
        CLOSE: {
          actions: assign(() => ({ flow: { kind: 'closed' }, savedSetup: undefined, resendSeconds: 0 })),
        },
        TICK: tick,
        SELECT_SMS: {
          actions: assign((_, event) => ({
            flow: {
              kind: 'sms',
              step: event.hasPhones ? 'select' : 'phone',
              origin: event.hasPhones ? 'existing' : 'new',
              selectedPhoneId: event.phoneId,
              phoneNumber: '',
              code: '',
            },
          })),
        },
        RESUME_AUTHENTICATOR: {
          actions: assign((_, event) => ({ flow: { kind: 'authenticator', setup: event.setup, code: '' } })),
        },
        ADD_PHONE: {
          actions: assign(context => ({
            flow:
              context.flow.kind === 'sms'
                ? {
                    ...context.flow,
                    step: 'phone',
                    origin: 'new',
                    phoneId: undefined,
                    phoneNumber: '',
                    code: '',
                    error: undefined,
                  }
                : context.flow,
          })),
        },
        BACK: {
          actions: assign((context, event) => {
            const flow = context.flow;
            if (flow.kind === 'sms' && flow.step === 'verify') {
              return {
                flow: { ...flow, step: flow.origin === 'new' ? 'phone' : 'select', code: '', error: undefined },
              };
            }
            if (flow.kind === 'sms' && flow.step === 'phone' && event.hasPhones) {
              return { flow: { ...flow, step: 'select', origin: 'existing', phoneId: undefined, error: undefined } };
            }
            return {
              flow: { kind: 'select' },
              savedSetup: flow.kind === 'authenticator' ? flow.setup : context.savedSetup,
            };
          }),
        },
        EDIT_PHONE_ID: {
          actions: assign((context, event) => ({
            flow:
              context.flow.kind === 'sms'
                ? { ...context.flow, selectedPhoneId: event.value, phoneId: undefined, origin: 'existing' }
                : context.flow,
          })),
        },
        EDIT_PHONE_NUMBER: {
          actions: assign((context, event) => ({
            flow:
              context.flow.kind === 'sms'
                ? {
                    ...context.flow,
                    phoneNumber: event.value,
                    phoneId: event.value === context.flow.phoneNumber ? context.flow.phoneId : undefined,
                  }
                : context.flow,
          })),
        },
        EDIT_CODE: {
          actions: assign((context, event) => ({
            flow:
              context.flow.kind === 'sms' || context.flow.kind === 'authenticator'
                ? { ...context.flow, code: event.value }
                : context.flow,
          })),
        },
        PRINT_FAILED: {
          actions: assign(context => ({
            flow:
              context.flow.kind === 'backup'
                ? { ...context.flow, error: { code: 'mfa_print_unavailable' } }
                : context.flow,
          })),
        },
        RUN: {
          target: 'busy',
          actions: assign((context, event) => ({
            flow: { ...context.flow, error: undefined },
            pending: event.key,
            pendingMethods: event.methods,
            dismissed: false,
            run: event.run,
            resolve: event.resolve,
            reject: event.reject,
          })),
        },
      },
    },
    busy: {
      on: {
        OPEN: {
          actions: assign(() => ({ flow: { kind: 'select' }, dismissed: true })),
        },
        CLOSE: {
          actions: assign(() => ({
            flow: { kind: 'closed' },
            savedSetup: undefined,
            resendSeconds: 0,
            dismissed: true,
          })),
        },
        TICK: tick,
      },
      invoke: fromPromise(context => context.run(), {
        onDone: {
          target: 'idle',
          actions: [
            context => context.resolve(),
            assign<DoneInvokeEvent<MfaFlow>>((context, event) => {
              if (context.dismissed && event.output.kind !== 'backup') {
                return { pending: undefined, dismissed: false };
              }
              return {
                flow: event.output,
                savedSetup:
                  event.output.kind === 'authenticator'
                    ? event.output.setup
                    : event.output.kind === 'closed'
                      ? undefined
                      : context.savedSetup,
                pending: undefined,
                dismissed: false,
                resendSeconds:
                  context.pending === 'resend' ||
                  (context.pending === 'sms' && event.output.kind === 'sms' && event.output.step === 'verify')
                    ? RESEND_COOLDOWN_SECONDS
                    : context.resendSeconds,
              };
            }),
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            (context, event) => context.reject(event.error),
            assign((context, event) => {
              const flow = context.flow;
              if (context.dismissed) {
                return { pending: undefined, dismissed: false };
              }
              if (isReverificationCancelledError(event.error)) {
                return { flow: { kind: 'closed' }, pending: undefined };
              }
              const error = toLocalizableError(event.error);
              return {
                flow: { ...flow, error },
                pending: undefined,
              };
            }),
          ],
        },
      }),
    },
  },
});

type MfaSend = (event: MfaEvent) => void;
type RunMfaAction = (key: MfaAction, action: () => Promise<MfaFlow>) => Promise<void>;

function createAuthenticatorActions(model: ReadyModel, flow: MfaFlow, run: RunMfaAction) {
  const prepareAuthenticator = () => {
    const createAuthenticator = model.createAuthenticator;
    if (!createAuthenticator) {
      return;
    }
    void run('prepareAuthenticator', async () => {
      const setup = await createAuthenticator();
      return { kind: 'authenticator', setup, code: '' };
    }).catch(() => undefined);
  };

  const verifyAuthenticator = (code: string) => {
    const verify = model.verifyAuthenticator;
    if (!verify || flow.kind !== 'authenticator') {
      return;
    }
    void run('verifyAuthenticator', async () => {
      const result = await verify(code);
      return result.backupCodes.length ? { kind: 'backup', codes: result.backupCodes } : { kind: 'closed' };
    }).catch(() => undefined);
  };

  return { prepareAuthenticator, verifyAuthenticator };
}

function createSmsActions(model: ReadyModel, flow: MfaFlow, resendSeconds: number, run: RunMfaAction) {
  const submitSms = (code?: string) => {
    const enrollSms = model.enrollSms;
    const enrollPhoneNumber = model.enrollPhoneNumber;
    if (!enrollSms || flow.kind !== 'sms') {
      return;
    }
    const current = flow;
    void run('sms', async () => {
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
          error: undefined,
        };
      }
      return result.status === 'complete' && result.backupCodes.length
        ? { kind: 'backup', codes: result.backupCodes }
        : { kind: 'closed' };
    }).catch(() => undefined);
  };

  const resendSms = () => {
    const resend = model.resendSms;
    if (flow.kind !== 'sms' || !flow.phoneId || !resend || resendSeconds > 0) {
      return;
    }
    const current = flow;
    void run('resend', async () => {
      await resend(current.phoneId ?? '');
      return { ...current, error: undefined };
    }).catch(() => undefined);
  };

  return { submitSms, resendSms };
}

function createBackupCodeActions(
  model: ReadyModel,
  flow: MfaFlow,
  run: RunMfaAction,
  send: MfaSend,
  m: MosaicMessages['userProfileBackupCodes'],
) {
  const fileValues = { applicationName: model.applicationName, identifier: model.identifier };
  const generateBackupCodes = () => {
    const generate = model.generateBackupCodes;
    if (!generate) {
      return Promise.resolve();
    }
    return run('generate', async () => {
      const codes = await generate();
      return { kind: 'backup', codes };
    }).catch(() => undefined);
  };

  const copy = () => {
    if (flow.kind !== 'backup' || !flow.codes.length) {
      return;
    }
    const codes = flow.codes;
    void run('copy', async () => {
      await navigator.clipboard.writeText(codes.join('\n'));
      return { kind: 'closed' };
    }).catch(() => undefined);
  };

  const download = () => {
    if (flow.kind !== 'backup' || !flow.codes.length) {
      return;
    }
    const content = [fill(m.fileIntro, fileValues), m.fileInstructions, '', ...flow.codes].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fill(m.fileName, fileValues);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const print = () => {
    if (flow.kind !== 'backup' || !flow.codes.length) {
      return;
    }
    const titleText = fill(m.printTitle, fileValues);
    const printable = window.open('', '_blank', 'width=640,height=720');
    if (!printable) {
      send({ type: 'PRINT_FAILED' });
      return;
    }
    try {
      printable.document.title = titleText;
      const title = printable.document.createElement('h1');
      title.textContent = titleText;
      const codes = printable.document.createElement('pre');
      codes.textContent = flow.codes.join('\n');
      printable.document.body.append(title, codes);
      printable.addEventListener('afterprint', () => printable.close(), { once: true });
      printable.setTimeout(() => printable.close(), 60_000);
      printable.focus();
      printable.print();
    } catch {
      printable.close();
      send({ type: 'PRINT_FAILED' });
    }
  };

  return { generateBackupCodes, copy, download, print };
}

interface MfaSetupActions {
  select: (method: UserProfileMfaAddableMethod) => void;
  back: () => void;
  close: () => void;
  submitSms: (code?: string) => void;
  resendSms: () => void;
  verifyAuthenticator: (code: string) => void;
  generateBackupCodes: () => void;
  copy: () => void;
  download: () => void;
  print: () => void;
}

function createSetupProps(
  model: ReadyModel,
  context: MfaContext,
  send: MfaSend,
  actions: MfaSetupActions,
  errorText: ReturnType<typeof useErrorText>,
  reverification: ReverificationController,
  reverifying: boolean,
): UserProfileMfaSetupViewProps {
  const flow = context.flow;
  const errorMessage = flow.error ? errorText(flow.error) : undefined;
  const sms = flow.kind === 'sms' ? flow : undefined;
  const authenticator = flow.kind === 'authenticator' ? flow : undefined;
  const backup = flow.kind === 'backup' ? flow : undefined;
  let step: UserProfileMfaSetupViewProps['step'];
  if (reverifying) {
    step = 'verify';
  } else if (flow.kind === 'closed') {
    step = 'select';
  } else if (flow.kind === 'backup') {
    step = 'backup-codes';
  } else {
    step = flow.kind;
  }
  return {
    step,
    pendingMethod: context.pending && PENDING_METHODS[context.pending],
    errorMessage,
    reverification,
    methods: context.pending ? context.pendingMethods : model.addableMethods,
    onSelect: actions.select,
    onBack: actions.back,
    onCancel: actions.close,
    sms: {
      step: sms?.step ?? 'select',
      phoneNumbers: model.phones,
      selectedPhoneId: sms?.selectedPhoneId ?? '',
      onSelectedPhoneIdChange: value => send({ type: 'EDIT_PHONE_ID', value }),
      onAddPhone: () => send({ type: 'ADD_PHONE' }),
      onBack: actions.back,
      phoneNumber: sms?.phoneNumber ?? '',
      onPhoneNumberChange: value => send({ type: 'EDIT_PHONE_NUMBER', value }),
      code: sms?.code ?? '',
      onCodeChange: value => send({ type: 'EDIT_CODE', value }),
      onSubmit: actions.submitSms,
      onResend: actions.resendSms,
      isPending: context.pending === 'sms',
      isResending: context.pending === 'resend',
      resendSeconds: context.resendSeconds,
      errorMessage,
    },
    authenticator: authenticator
      ? {
          setup: authenticator.setup,
          code: authenticator.code,
          onCodeChange: value => send({ type: 'EDIT_CODE', value }),
          onSubmit: actions.verifyAuthenticator,
          isPending: context.pending === 'verifyAuthenticator',
          errorMessage,
        }
      : undefined,
    backupCodes: {
      codes: backup?.codes ?? [],
      onRetry: actions.generateBackupCodes,
      onCopy: actions.copy,
      onDownload: actions.download,
      onPrint: actions.print,
      pendingAction: context.pending === 'generate' || context.pending === 'copy' ? context.pending : undefined,
      errorMessage,
    },
  };
}

export function useUserProfileMfaController(model: ReadyModel) {
  const pendingAction = usePendingAction();
  const errorText = useErrorText();
  const backupCodeMessages = useMessages('userProfileBackupCodes');
  const [{ context, value }, send] = useMachine(mfaMachine);
  const isBusy = value === 'busy';
  const run: RunMfaAction = (key, action) => {
    if (isBusy) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      send({ type: 'RUN', key, methods: model.addableMethods, run: action, resolve, reject });
    });
  };
  const { resendSeconds } = context;
  const flow = context.flow;
  // The machine guarantees that only one is running/visible at a time
  const reverification =
    [model.createPhoneReverification, model.enrollSmsReverification, model.authenticatorReverification].find(
      controller => controller.visible,
    ) ?? model.backupCodesReverification;
  const hasPendingReverification = context.pending !== undefined && REVERIFIABLE_ACTIONS.includes(context.pending);
  const reverifying = hasPendingReverification && reverification.visible;
  const dialogOpen = flow.kind !== 'closed' || reverifying;
  useEffect(() => {
    if (!dialogOpen || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [dialogOpen, resendSeconds, send]);
  const { prepareAuthenticator, verifyAuthenticator } = createAuthenticatorActions(model, flow, run);
  const { submitSms, resendSms } = createSmsActions(model, flow, resendSeconds, run);
  const { generateBackupCodes, copy, download, print } = createBackupCodeActions(
    model,
    flow,
    run,
    send,
    backupCodeMessages,
  );

  const close = () => send({ type: 'CLOSE' });
  const back = () => send({ type: 'BACK', hasPhones: model.phones.length > 0 });

  const select = (method: UserProfileMfaAddableMethod) => {
    if (isBusy) {
      return;
    }
    if (method === 'authenticator') {
      if (context.savedSetup) {
        send({ type: 'RESUME_AUTHENTICATOR', setup: context.savedSetup });
      } else {
        prepareAuthenticator();
      }
    } else if (method === 'backup-codes') {
      void generateBackupCodes();
    } else {
      send({ type: 'SELECT_SMS', phoneId: model.phones[0]?.id ?? '', hasPhones: model.phones.length > 0 });
    }
  };

  const setupProps = createSetupProps(
    model,
    context,
    send,
    {
      select,
      back,
      close,
      submitSms,
      resendSms,
      verifyAuthenticator,
      generateBackupCodes: () => void generateBackupCodes(),
      copy,
      download,
      print,
    },
    errorText,
    reverification,
    reverifying,
  );

  const sectionProps: UserProfileMfaSectionViewProps = {
    pendingAction,
    methods: [...model.methods],
    addableMethods: model.addableMethods,
    regenerate: model.generateBackupCodes
      ? {
          onClick: () => void pendingAction.run('regenerate', generateBackupCodes),
          status: context.pending === 'generate' && !dialogOpen ? 'pending' : 'idle',
          error: flow.kind === 'closed' && flow.error ? errorText(flow.error) : undefined,
        }
      : undefined,
    onRemove: model.remove,
    onSetDefault: model.setDefault,
    removeReverification: model.removeReverification,
    setDefaultReverification: model.setDefaultReverification,
  };

  const showAddTrigger = model.addableMethods.length > 0;
  const canClose = !hasPendingReverification || Boolean(reverification.onCancel);

  return {
    dialogOpen,
    showAddTrigger,
    showAddControl: showAddTrigger || dialogOpen,
    isPending: isBusy || pendingAction.isPending,
    reverifying,
    onDialogOpenChange: (open: boolean) => {
      if (!open && !canClose) {
        return;
      }
      if (!open && hasPendingReverification) {
        reverification.onCancel?.();
      }
      send({ type: open ? 'OPEN' : 'CLOSE' });
    },
    showCloseButton: canClose,
    sectionProps,
    setupProps,
  };
}
