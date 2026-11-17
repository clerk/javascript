import { useForm } from '../../../components/form';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import { useMachine } from '../../../machine/use-machine';
import type {
  AccessConnection,
  AccessData,
  AccessProvider,
  ConnectionKind,
  ConnectionTestResult,
} from './access.types';
import { isConnectionConfigured, isDirectoryConfigured, isServiceAccountFile, newConnection } from './access.utils';

interface ConnectionContext {
  kind: ConnectionKind;
  tokenVisible: boolean;
  direction: 1 | -1;
  result: ConnectionTestResult | null;
  saved: AccessConnection | null;
  configured: AccessConnection | null;
  testUrl: string;
  onComplete: (connection: AccessConnection) => void;
}
type ConnectionEvent =
  | { type: 'START'; kind: ConnectionKind }
  | { type: 'REVEAL_TOKEN' }
  | { type: 'NEXT'; connection?: AccessConnection }
  | { type: 'TEST_STARTED'; url: string }
  | { type: 'DIRECTORY_CREATED'; connection: AccessConnection }
  | { type: 'BACK' }
  | { type: 'TESTED'; result: ConnectionTestResult }
  | { type: 'SAVED'; connection: AccessConnection }
  | { type: 'COMPLETE' };
const { createMachine, assign } = setup<ConnectionContext, ConnectionEvent>();
const forward = assign((context: ConnectionContext, event: ConnectionEvent) => ({
  direction: 1 as const,
  configured: event.type === 'NEXT' ? (event.connection ?? context.configured) : context.configured,
}));
const back = assign(() => ({ direction: -1 as const, result: null }));
const restart = {
  target: 'provider' as const,
  actions: assign((_: ConnectionContext, event: Extract<ConnectionEvent, { type: 'START' }>) => ({
    kind: event.kind,
    direction: 1 as const,
    result: null,
    saved: null,
    configured: null,
    testUrl: '',
    tokenVisible: false,
  })),
};
export const connectionMachine = createMachine({
  initial: 'provider',
  context: {
    kind: 'sso',
    tokenVisible: false,
    direction: 1,
    result: null,
    saved: null,
    configured: null,
    testUrl: '',
    onComplete: () => undefined,
  },
  states: {
    provider: { on: { START: restart, NEXT: { target: 'configure', actions: forward } } },
    configure: {
      on: {
        DIRECTORY_CREATED: { actions: assign((_, event) => ({ configured: event.connection, tokenVisible: true })) },
        REVEAL_TOKEN: { actions: assign(() => ({ tokenVisible: true })) },
        START: restart,
        NEXT: { target: 'attributes', actions: forward },
        BACK: { target: 'provider', actions: back },
      },
    },
    attributes: {
      on: {
        START: restart,
        NEXT: [
          { guard: context => context.kind === 'directory', target: 'test', actions: forward },
          { target: 'assignment', actions: forward },
        ],
        BACK: { target: 'configure', actions: back },
      },
    },
    assignment: {
      on: {
        START: restart,
        NEXT: { target: 'metadata', actions: forward },
        BACK: { target: 'attributes', actions: back },
      },
    },
    metadata: {
      on: { START: restart, NEXT: { target: 'test', actions: forward }, BACK: { target: 'assignment', actions: back } },
    },
    test: {
      on: {
        START: restart,
        TEST_STARTED: { actions: assign((_, event) => ({ testUrl: event.url, result: null })) },
        TESTED: { actions: assign((_, event) => ({ result: event.result })) },
        NEXT: {
          guard: context => context.kind === 'directory' && context.result?.success === true,
          target: 'roles',
          actions: forward,
        },
        BACK: [
          { guard: context => context.kind === 'directory', target: 'attributes', actions: back },
          { target: 'metadata', actions: back },
        ],
        SAVED: {
          guard: context => context.result?.success === true,
          target: 'saved',
          actions: assign((_, event) => ({ saved: event.connection })),
        },
      },
    },
    roles: {
      on: {
        START: restart,
        BACK: { target: 'test', actions: back },
        SAVED: { target: 'saved', actions: assign((_, event) => ({ saved: event.connection })) },
      },
    },
    saved: {
      on: {
        START: restart,
        COMPLETE: {
          target: 'complete',
          actions: context => {
            if (context.saved) {
              context.onComplete(context.saved);
            }
          },
        },
      },
    },
    complete: { on: { START: restart } },
  },
});

export function useAccessConnectionController(
  data: AccessData,
  onComplete: (connection: AccessConnection) => void,
  onClose: () => void,
) {
  const m = useMessages('organizationProfile').access;
  const [state, send] = useMachine(connectionMachine, { context: { onComplete } });
  const { kind, result, configured, testUrl } = state.context;
  const test = usePendingAction({ errorFallback: m.testError });
  const canSave = state.value === 'roles' || (state.value === 'test' && kind === 'sso' && result?.success === true);
  const saveStep = (values: ReturnType<typeof newConnection>) => {
    if (data.live && kind === 'sso' && state.value === 'configure') {
      return configured ?? data.onSaveConnection?.('sso', values);
    }
    if (data.live && kind === 'sso' && state.value === 'metadata') {
      return data.onSaveConnection?.('sso', values, configured?.id);
    }
    if (data.live && kind === 'directory' && state.value === 'configure') {
      return configured ?? data.onConfigureDirectory?.(values);
    }
    if (canSave && data.live && kind === 'sso' && configured) {
      return data.onEnableSso?.(configured.id);
    }
    return canSave ? data.onSaveConnection?.(kind, values) : undefined;
  };
  const form = useForm({
    initialValues: newConnection(),
    fields: {
      serviceAccountFile: {
        validateAsync: async file =>
          file && !(await isServiceAccountFile(file)) ? { type: 'error', message: m.invalidKey } : undefined,
      },
    },
    canSubmit: values => {
      if (state.value === 'configure') {
        return kind === 'directory' ? isDirectoryConfigured(values) : Boolean(values.name.trim());
      }
      if (state.value === 'metadata') {
        return isConnectionConfigured(values);
      }
      return canSave;
    },
    onSubmit: values => Promise.resolve(saveStep(values)),
    onSuccess: connection => send(canSave && connection ? { type: 'SAVED', connection } : { type: 'NEXT', connection }),
    errorFallback: m.saveError,
  });
  const matchingSsoConnections = data.connections.filter(
    connection =>
      connection.kind === 'sso' &&
      connection.configuration.provider === form.values.provider &&
      (!data.live ||
        connection.id === configured?.configuration.ssoConnectionId ||
        !data.connections.some(
          item => item.kind === 'directory' && item.configuration.ssoConnectionId === connection.id,
        )),
  );
  const validSsoDomains =
    !data.live || kind !== 'sso' || state.value !== 'configure' || Boolean(form.values.domains?.length);
  const startTest = data.onStartSsoTest;
  const pending = form.isSubmitting || test.isPending;
  const canContinue =
    !pending &&
    (!data.live || kind !== 'directory' || state.value !== 'provider' || matchingSsoConnections.length > 0) &&
    validSsoDomains &&
    (state.value !== 'configure' ||
      (kind === 'directory'
        ? isDirectoryConfigured(form.values) &&
          !form.fields.serviceAccountFile.isValidating &&
          form.fields.serviceAccountFile.feedback?.type !== 'error'
        : Boolean(form.values.name.trim()))) &&
    (state.value !== 'metadata' || isConnectionConfigured(form.values)) &&
    (state.value !== 'test' || result?.success === true);
  return {
    form,
    matchingSsoConnections,
    kind,
    step: state.value,
    progress: state.value === 'provider' ? 1 : ['test', 'roles', 'saved', 'complete'].includes(state.value) ? 3 : 2,
    direction: state.context.direction,
    result,
    configured,
    testUrl,
    onStartTest:
      configured && startTest
        ? () => {
            void test.run('start', async () => {
              const url = await startTest(configured.id);
              send({ type: 'TEST_STARTED', url });
            });
          }
        : undefined,
    directoryStep: Math.max(1, ['configure', 'attributes', 'test', 'roles'].indexOf(state.value) + 1),
    tokenVisible: state.context.tokenVisible,
    onRevealToken: () => send({ type: 'REVEAL_TOKEN' }),
    onCreateDirectory:
      data.live && kind === 'directory'
        ? () => {
            const configure = data.onConfigureDirectory;
            if (configure && isDirectoryConfigured(form.values)) {
              void test.run('directory', async () => {
                const connection = await configure(form.values);
                send({ type: 'DIRECTORY_CREATED', connection });
              });
            }
          }
        : undefined,
    test,
    pending,
    canContinue,
    canSave,
    open: (nextKind: ConnectionKind) => {
      form.reset({ ...newConnection(), name: m.providers.okta, domains: data.eligibleSsoDomains?.slice(0, 1) });
      test.reset();
      send({ type: 'START', kind: nextKind });
    },
    onProvider: (provider: AccessProvider) => {
      if (provider === form.values.provider) {
        return;
      }
      test.reset();
      send({ type: 'START', kind });
      form.reset({
        ...newConnection(),
        provider,
        name: m.providers[provider],
        domains: data.eligibleSsoDomains?.slice(0, 1),
      });
      form.setValue('name', m.providers[provider]);
    },
    onModeChange: (value: string) => {
      if (value === 'metadata' || value === 'file' || value === 'manual') {
        form.setValue('mode', value);
      }
    },
    onBack: () => {
      if (!form.isSubmitting && !test.isPending) {
        send({ type: 'BACK' });
      }
    },
    onContinue: () => {
      if (!canContinue) {
        return;
      }
      if (state.value === 'provider' && kind === 'directory' && matchingSsoConnections.length === 1) {
        form.setValue('ssoConnectionId', matchingSsoConnections[0]?.id ?? '');
      }
      if (state.value === 'saved') {
        send({ type: 'COMPLETE' });
      } else if (canSave || state.value === 'configure' || state.value === 'metadata') {
        form.submit();
      } else {
        send({ type: 'NEXT' });
      }
    },
    onOpenChange: (open: boolean) => {
      if (!open && !form.isSubmitting && !test.isPending) {
        onClose();
      }
    },
    onTest: () => {
      void test.run('test', async () => {
        const result = await data.onTestConnection?.(kind, form.values, configured?.id);
        if (result) {
          send({ type: 'TESTED', result });
        }
      });
    },
  };
}
export type AccessConnectionController = ReturnType<typeof useAccessConnectionController>;
