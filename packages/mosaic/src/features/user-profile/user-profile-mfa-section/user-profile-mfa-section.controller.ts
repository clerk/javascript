import { useEffect } from 'react';

import { type ErrorDescription, fill, type MosaicMessages, useErrorText, useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { DoneInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/errors';
import type { UserProfileMfaAddableMethod, UserProfileMfaModel } from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';
import type { UserProfileMfaSetupViewProps } from './user-profile-mfa-setup.view';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;
type AuthenticatorSetup = { secret: string; uri: string };
type MfaAction = 'prepareAuthenticator' | 'verifyAuthenticator' | 'sms' | 'resend' | 'generate' | 'copy';
type MfaFlow =
  | { kind: 'closed' }
  | { kind: 'select' }
  | {
      kind: 'authenticator';
      setup?: AuthenticatorSetup;
      code: string;
      error?: ErrorDescription;
      setupError?: ErrorDescription;
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
  dismissed: boolean;
  resendSeconds: number;
  run: () => Promise<MfaFlow>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

type MfaEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SELECT'; method: UserProfileMfaAddableMethod; phoneId: string; hasPhones: boolean }
  | { type: 'BACK'; hasPhones: boolean }
  | { type: 'EDIT_PHONE_ID'; value: string }
  | { type: 'EDIT_PHONE_NUMBER'; value: string }
  | { type: 'EDIT_CODE'; value: string }
  | { type: 'PHONE_RESOLVED'; id: string; phoneNumber: string }
  | { type: 'PRINT_FAILED' }
  | { type: 'TICK' }
  | { type: 'RUN'; key: MfaAction; run: () => Promise<MfaFlow>; resolve: () => void; reject: (error: unknown) => void };

const { createMachine, assign, fromPromise } = setup<MfaContext, MfaEvent>();
const RESEND_COOLDOWN_SECONDS = 30;
const tick = { actions: assign(context => ({ resendSeconds: Math.max(0, context.resendSeconds - 1) })) };

const mfaMachine = createMachine({
  id: 'userProfileMfa',
  initial: 'idle',
  context: {
    flow: { kind: 'closed' },
    dismissed: false,
    resendSeconds: 0,
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
        SELECT: {
          actions: assign((context, event) => ({
            flow:
              event.method === 'sms'
                ? {
                    kind: 'sms',
                    step: event.hasPhones ? 'select' : 'phone',
                    origin: event.hasPhones ? 'existing' : 'new',
                    selectedPhoneId: event.phoneId,
                    phoneNumber: '',
                    code: '',
                  }
                : event.method === 'backup-codes'
                  ? { kind: 'backup', codes: [] }
                  : { kind: 'authenticator', setup: context.savedSetup, code: '' },
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
              return { flow: { ...flow, step: 'select', error: undefined } };
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
          actions: assign((_, event) => ({
            pending: event.key,
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
        OPEN: { actions: assign(() => ({ flow: { kind: 'select' }, dismissed: true })) },
        CLOSE: {
          actions: assign(() => ({
            flow: { kind: 'closed' },
            savedSetup: undefined,
            resendSeconds: 0,
            dismissed: true,
          })),
        },
        TICK: tick,
        PHONE_RESOLVED: {
          actions: assign((context, event) => ({
            flow:
              context.flow.kind === 'sms'
                ? { ...context.flow, phoneId: event.id, phoneNumber: event.phoneNumber }
                : context.flow,
          })),
        },
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
                  event.output.kind === 'authenticator' && event.output.setup
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
              if (flow.kind !== 'authenticator' && flow.kind !== 'sms' && flow.kind !== 'backup') {
                return { pending: undefined };
              }
              const error = toLocalizableError(event.error);
              return {
                flow:
                  flow.kind === 'authenticator'
                    ? {
                        ...flow,
                        ...(context.pending === 'prepareAuthenticator' ? { setupError: error } : { error }),
                      }
                    : { ...flow, error },
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
    if (!verify || flow.kind !== 'authenticator' || !flow.setup) {
      return;
    }
    void run('verifyAuthenticator', async () => {
      const result = await verify(code);
      return result.backupCodes.length ? { kind: 'backup', codes: result.backupCodes } : { kind: 'closed' };
    }).catch(() => undefined);
  };

  return { prepareAuthenticator, verifyAuthenticator };
}

function createSmsActions(model: ReadyModel, flow: MfaFlow, resendSeconds: number, run: RunMfaAction, send: MfaSend) {
  const submitSms = (code?: string) => {
    const enrollSms = model.enrollSms;
    const findOrCreatePhone = model.findOrCreatePhone;
    if (!enrollSms || flow.kind !== 'sms') {
      return;
    }
    const current = flow;
    void run('sms', async () => {
      let phoneId = current.phoneId ?? current.selectedPhoneId;
      if (current.step === 'phone' && !phoneId) {
        if (!findOrCreatePhone) {
          return current;
        }
        const phone = await findOrCreatePhone(current.phoneNumber);
        phoneId = phone.id;
        send({ type: 'PHONE_RESOLVED', id: phone.id, phoneNumber: phone.phoneNumber });
      }
      const result = await enrollSms(phoneId, code ?? (current.step === 'verify' ? current.code : undefined));
      if (result.status === 'needsVerification') {
        return { ...current, step: 'verify', phoneId, phoneNumber: result.phone.phoneNumber, error: undefined };
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
      return;
    }
    send({ type: 'SELECT', method: 'backup-codes', phoneId: '', hasPhones: false });
    void run('generate', async () => {
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
  prepareAuthenticator: () => void;
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
): UserProfileMfaSetupViewProps {
  const flow = context.flow;
  const sms = flow.kind === 'sms' ? flow : undefined;
  const authenticator = flow.kind === 'authenticator' ? flow : undefined;
  const backup = flow.kind === 'backup' ? flow : undefined;
  return {
    step: flow.kind === 'closed' ? 'select' : flow.kind === 'backup' ? 'backup-codes' : flow.kind,
    methods: model.addableMethods,
    onSelect: actions.select,
    onBack: actions.back,
    onCancel: actions.close,
    sms: {
      step: sms?.step ?? 'select',
      phoneNumbers: model.phones,
      selectedPhoneId: sms?.selectedPhoneId ?? '',
      onSelectedPhoneIdChange: value => send({ type: 'EDIT_PHONE_ID', value }),
      onAddPhone: () => send({ type: 'SELECT', method: 'sms', phoneId: '', hasPhones: false }),
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
      errorMessage: sms?.error ? errorText(sms.error) : undefined,
    },
    authenticator: {
      setup: authenticator?.setup,
      setupErrorMessage: authenticator?.setupError ? errorText(authenticator.setupError) : undefined,
      onRetry: actions.prepareAuthenticator,
      code: authenticator?.code ?? '',
      onCodeChange: value => send({ type: 'EDIT_CODE', value }),
      onSubmit: actions.verifyAuthenticator,
      isPending: context.pending === 'prepareAuthenticator' || context.pending === 'verifyAuthenticator',
      errorMessage: authenticator?.error ? errorText(authenticator.error) : undefined,
    },
    backupCodes: {
      codes: backup?.codes ?? [],
      onRetry: actions.generateBackupCodes,
      onCopy: actions.copy,
      onDownload: actions.download,
      onPrint: actions.print,
      pendingAction: context.pending === 'generate' || context.pending === 'copy' ? context.pending : undefined,
      errorMessage: backup?.error ? errorText(backup.error) : undefined,
    },
  };
}

export function useUserProfileMfaController(model: ReadyModel) {
  const errorText = useErrorText();
  const backupCodeMessages = useMessages('userProfileBackupCodes');
  const [{ context, value }, send] = useMachine(mfaMachine);
  const isBusy = value === 'busy';
  const run: RunMfaAction = (key, action) => {
    if (isBusy) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      send({ type: 'RUN', key, run: action, resolve, reject });
    });
  };
  const { resendSeconds } = context;
  const flow = context.flow;
  const dialogOpen = flow.kind !== 'closed';
  useEffect(() => {
    if (!dialogOpen || resendSeconds === 0) {
      return;
    }
    const timer = setTimeout(() => send({ type: 'TICK' }), 1000);
    return () => clearTimeout(timer);
  }, [dialogOpen, resendSeconds, send]);
  const { prepareAuthenticator, verifyAuthenticator } = createAuthenticatorActions(model, flow, run);
  const { submitSms, resendSms } = createSmsActions(model, flow, resendSeconds, run, send);
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
    send({ type: 'SELECT', method, phoneId: model.phones[0]?.id ?? '', hasPhones: model.phones.length > 0 });
    if (method === 'authenticator' && !context.savedSetup) {
      prepareAuthenticator();
    }
    if (method === 'backup-codes') {
      generateBackupCodes();
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
      prepareAuthenticator,
      verifyAuthenticator,
      generateBackupCodes,
      copy,
      download,
      print,
    },
    errorText,
  );

  const sectionProps: UserProfileMfaSectionViewProps = {
    methods: [...model.methods],
    addableMethods: model.addableMethods,
    onRegenerateBackupCodes: model.generateBackupCodes ? generateBackupCodes : undefined,
    onRemove: model.remove,
    onSetDefault: model.setDefault,
  };

  const showAddTrigger = model.addableMethods.length > 0;

  return {
    dialogOpen,
    showAddTrigger,
    showAddControl: showAddTrigger || dialogOpen,
    onDialogOpenChange: (open: boolean) => send({ type: open ? 'OPEN' : 'CLOSE' }),
    sectionProps,
    setupProps,
  };
}
