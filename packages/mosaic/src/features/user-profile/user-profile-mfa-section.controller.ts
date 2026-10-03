import { useEffect, useRef, useState } from 'react';

import { useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import {
  MfaCancelledError,
  type UserProfileMfaAddableMethod,
  type UserProfileMfaModel,
} from './user-profile-mfa-section.types';
import type { UserProfileMfaSectionViewProps } from './user-profile-mfa-section.view';
import type { UserProfileMfaSetupViewProps } from './user-profile-mfa-setup.view';

type ReadyModel = Extract<UserProfileMfaModel, { status: 'ready' }>;
type AuthenticatorSetup = { secret: string; uri: string };
type MfaFlow =
  | { kind: 'closed' }
  | { kind: 'select' }
  | { kind: 'authenticator'; setup?: AuthenticatorSetup; code: string; error?: string; setupError?: string }
  | {
      kind: 'sms';
      step: 'select' | 'phone' | 'verify';
      origin: 'existing' | 'new';
      selectedPhoneId: string;
      phoneId?: string;
      phoneNumber: string;
      code: string;
      error?: string;
    }
  | { kind: 'backup'; codes: readonly string[]; error?: string };

interface MfaContext {
  flow: MfaFlow;
  savedSetup?: AuthenticatorSetup;
  pending?: string;
  resendAvailableAt?: number;
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
  | { type: 'PHONE_CREATED'; id: string; phoneNumber: string }
  | { type: 'PRINT_FAILED'; message: string }
  | { type: 'RUN'; key: string; run: () => Promise<MfaFlow>; resolve: () => void; reject: (error: unknown) => void };

const { createMachine, assign, fromPromise } = setup<MfaContext, MfaEvent>();
const RESEND_COOLDOWN_MS = 30_000;

const mfaMachine = createMachine({
  id: 'userProfileMfa',
  initial: 'idle',
  context: {
    flow: { kind: 'closed' },
    run: () => Promise.resolve({ kind: 'closed' }),
    resolve: () => undefined,
    reject: () => undefined,
  },
  states: {
    idle: {
      on: {
        OPEN: { actions: assign(() => ({ flow: { kind: 'select' } })) },
        CLOSE: {
          actions: assign(() => ({ flow: { kind: 'closed' }, savedSetup: undefined, resendAvailableAt: undefined })),
        },
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
          actions: assign((context, event) => ({
            flow: context.flow.kind === 'backup' ? { ...context.flow, error: event.message } : context.flow,
          })),
        },
        RUN: {
          target: 'busy',
          actions: assign((_, event) => ({
            pending: event.key,
            run: event.run,
            resolve: event.resolve,
            reject: event.reject,
          })),
        },
      },
    },
    busy: {
      on: {
        PHONE_CREATED: {
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
            assign((context, event) => ({
              flow: event.output,
              savedSetup:
                event.output.kind === 'authenticator' && event.output.setup
                  ? event.output.setup
                  : event.output.kind === 'closed'
                    ? undefined
                    : context.savedSetup,
              pending: undefined,
              resendAvailableAt:
                context.pending === 'resend' ||
                (context.pending === 'sms' && event.output.kind === 'sms' && event.output.step === 'verify')
                  ? Date.now() + RESEND_COOLDOWN_MS
                  : context.resendAvailableAt,
            })),
          ],
        },
        onError: {
          target: 'idle',
          actions: [
            (context, event) => context.reject(event.error),
            assign((context, event) => {
              if (event.error instanceof MfaCancelledError) {
                return { flow: { kind: 'closed' }, savedSetup: undefined, pending: undefined };
              }
              const message =
                event.error instanceof Error ? event.error.message : 'This action could not be completed.';
              const flow = context.flow;
              return {
                flow:
                  flow.kind === 'authenticator'
                    ? {
                        ...flow,
                        ...(context.pending === 'prepareAuthenticator' ? { setupError: message } : { error: message }),
                      }
                    : flow.kind === 'sms' || flow.kind === 'backup'
                      ? { ...flow, error: message }
                      : flow,
                pending: undefined,
              };
            }),
          ],
        },
      }),
    },
  },
});

export function useUserProfileMfaController(model: ReadyModel) {
  const m = useMessages('userProfileMfa');
  const [{ context, value }, send] = useMachine(mfaMachine);
  const locked = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const resendAvailableAt = context.resendAvailableAt;
  const resendSeconds = resendAvailableAt ? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)) : 0;
  useEffect(() => {
    if (!resendSeconds) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);
  const flow = context.flow;
  const run = (key: string, action: () => Promise<MfaFlow>): Promise<void> => {
    if (locked.current || value === 'busy') {
      return Promise.reject(new Error(m.errors.busy));
    }
    locked.current = true;
    return new Promise<void>((resolve, reject) => {
      send({
        type: 'RUN',
        key,
        run: action,
        resolve: () => {
          locked.current = false;
          resolve();
        },
        reject: error => {
          locked.current = false;
          reject(error instanceof Error ? error : new Error(m.errors.unexpectedResponse));
        },
      });
    });
  };

  const close = () => send({ type: 'CLOSE' });
  const back = () => send({ type: 'BACK', hasPhones: model.phones.length > 0 });

  const prepareAuthenticator = () => {
    if (!model.createAuthenticator) {
      return;
    }
    void run('prepareAuthenticator', async () => {
      const setup = await model.createAuthenticator?.();
      return setup ? { kind: 'authenticator', setup, code: '' } : { kind: 'select' };
    }).catch(() => undefined);
  };

  const generateBackupCodes = () => {
    if (!model.generateBackupCodes) {
      return;
    }
    send({ type: 'SELECT', method: 'backup-codes', phoneId: '', hasPhones: false });
    void run('generate', async () => {
      const codes = await model.generateBackupCodes?.();
      return { kind: 'backup', codes: codes ?? [] };
    }).catch(() => undefined);
  };

  const select = (method: UserProfileMfaAddableMethod) => {
    if (locked.current) {
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

  const verifyAuthenticator = (code: string) => {
    if (!model.verifyAuthenticator || flow.kind !== 'authenticator' || !flow.setup) {
      return;
    }
    void run('verifyAuthenticator', async () => {
      const result = await model.verifyAuthenticator?.(code);
      return result?.backupCodes.length ? { kind: 'backup', codes: result.backupCodes } : { kind: 'closed' };
    }).catch(() => undefined);
  };

  const submitSms = (code?: string) => {
    if (!model.enrollSms || flow.kind !== 'sms') {
      return;
    }
    const current = flow;
    void run('sms', async () => {
      let phoneId = current.phoneId ?? current.selectedPhoneId;
      if (current.step === 'phone' && !phoneId) {
        const created = await model.createPhone?.(current.phoneNumber);
        if (!created) {
          return current;
        }
        phoneId = created.id;
        send({ type: 'PHONE_CREATED', id: created.id, phoneNumber: created.phoneNumber });
      }
      const result = await model.enrollSms?.(phoneId, code ?? (current.step === 'verify' ? current.code : undefined));
      if (result?.status === 'needsVerification') {
        return { ...current, step: 'verify', phoneId, phoneNumber: result.phone.phoneNumber, error: undefined };
      }
      return result?.status === 'complete' && result.backupCodes.length
        ? { kind: 'backup', codes: result.backupCodes }
        : { kind: 'closed' };
    }).catch(() => undefined);
  };

  const resendSms = () => {
    if (
      flow.kind !== 'sms' ||
      !flow.phoneId ||
      !model.resendSms ||
      (resendAvailableAt && Date.now() < resendAvailableAt)
    ) {
      return;
    }
    const current = flow;
    void run('resend', async () => {
      await model.resendSms?.(current.phoneId ?? '');
      return { ...current, error: undefined };
    }).catch(() => undefined);
  };

  const remove = (id: string) =>
    run('remove', async () => {
      await model.remove(id);
      return flow;
    });
  const setDefault = model.setDefault
    ? (id: string) =>
        run('default', async () => {
          await model.setDefault?.(id);
          return flow;
        })
    : undefined;

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
    const url = URL.createObjectURL(new Blob([flow.codes.join('\n')], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'clerk-backup-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const print = (titleText: string, unavailableMessage: string) => {
    if (flow.kind !== 'backup' || !flow.codes.length) {
      return;
    }
    const printable = window.open('', '_blank', 'width=640,height=720');
    if (!printable) {
      send({ type: 'PRINT_FAILED', message: unavailableMessage });
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
      send({ type: 'PRINT_FAILED', message: unavailableMessage });
    }
  };

  const setupProps: UserProfileMfaSetupViewProps = {
    step:
      flow.kind === 'closed' || flow.kind === 'backup'
        ? flow.kind === 'backup'
          ? 'backup-codes'
          : 'select'
        : flow.kind,
    methods: model.addableMethods,
    onSelect: select,
    onBack: back,
    onCancel: close,
    sms: {
      step: flow.kind === 'sms' ? flow.step : 'select',
      phoneNumbers: model.phones,
      selectedPhoneId: flow.kind === 'sms' ? flow.selectedPhoneId : '',
      onSelectedPhoneIdChange: value => send({ type: 'EDIT_PHONE_ID', value }),
      onAddPhone: () => send({ type: 'SELECT', method: 'sms', phoneId: '', hasPhones: false }),
      onBack: back,
      phoneNumber: flow.kind === 'sms' ? flow.phoneNumber : '',
      onPhoneNumberChange: value => send({ type: 'EDIT_PHONE_NUMBER', value }),
      code: flow.kind === 'sms' ? flow.code : '',
      onCodeChange: value => send({ type: 'EDIT_CODE', value }),
      onSubmit: submitSms,
      onResend: resendSms,
      isPending: context.pending === 'sms',
      isResending: context.pending === 'resend',
      resendSeconds,
      errorMessage: flow.kind === 'sms' ? flow.error : undefined,
    },
    authenticator: {
      setup: flow.kind === 'authenticator' ? flow.setup : undefined,
      setupErrorMessage: flow.kind === 'authenticator' ? flow.setupError : undefined,
      onRetry: prepareAuthenticator,
      code: flow.kind === 'authenticator' ? flow.code : '',
      onCodeChange: value => send({ type: 'EDIT_CODE', value }),
      onSubmit: verifyAuthenticator,
      isPending: context.pending === 'prepareAuthenticator' || context.pending === 'verifyAuthenticator',
      errorMessage: flow.kind === 'authenticator' ? flow.error : undefined,
    },
    backupCodes: {
      codes: flow.kind === 'backup' ? flow.codes : [],
      onRetry: generateBackupCodes,
      onCopy: copy,
      onDownload: download,
      onPrint: print,
      pendingAction: context.pending === 'generate' ? 'generate' : context.pending === 'copy' ? 'copy' : undefined,
      errorMessage: flow.kind === 'backup' ? flow.error : undefined,
    },
  };

  const sectionProps: UserProfileMfaSectionViewProps = {
    methods: [...model.methods],
    addableMethods: model.addableMethods,
    onRegenerateBackupCodes: model.generateBackupCodes ? generateBackupCodes : undefined,
    onRemove: remove,
    onSetDefault: setDefault,
  };

  return {
    dialogOpen: flow.kind !== 'closed',
    showAddTrigger: model.addableMethods.length > 0,
    onDialogOpenChange: (open: boolean) => {
      if (!open && model.reverification.phase === 'active') {
        model.reverification.cancel();
        return;
      }
      send({ type: open ? 'OPEN' : 'CLOSE' });
    },
    sectionProps,
    setupProps,
  };
}
