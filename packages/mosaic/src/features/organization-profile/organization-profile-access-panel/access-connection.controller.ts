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
import { isConnectionConfigured, isDirectoryConfigured, newConnection } from './access.utils';

interface ConnectionContext {
  kind: ConnectionKind;
  id?: string;
  tokenVisible: boolean;
  direction: 1 | -1;
  result: ConnectionTestResult | null;
  saved: AccessConnection | null;
  onComplete: (connection: AccessConnection) => void;
}
type ConnectionEvent =
  | { type: 'START'; kind: ConnectionKind; id?: string }
  | { type: 'REVEAL_TOKEN' }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'TESTED'; result: ConnectionTestResult }
  | { type: 'SAVED'; connection: AccessConnection }
  | { type: 'COMPLETE' };
const { createMachine, assign } = setup<ConnectionContext, ConnectionEvent>();
const forward = assign(() => ({ direction: 1 as const }));
const back = assign(() => ({ direction: -1 as const, result: null }));
const restart = {
  target: 'provider' as const,
  actions: assign((_: ConnectionContext, event: Extract<ConnectionEvent, { type: 'START' }>) => ({
    kind: event.kind,
    id: event.id,
    direction: 1 as const,
    result: null,
    saved: null,
    tokenVisible: false,
  })),
};
export const connectionMachine = createMachine({
  initial: 'provider',
  context: { kind: 'sso', tokenVisible: false, direction: 1, result: null, saved: null, onComplete: () => undefined },
  states: {
    provider: { on: { START: restart, NEXT: { target: 'configure', actions: forward } } },
    configure: {
      on: {
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
  const { kind, id, result } = state.context;
  const test = usePendingAction({ errorFallback: m.testError });
  const canSave = state.value === 'roles' || (state.value === 'test' && kind === 'sso' && result?.success === true);
  const form = useForm({
    initialValues: newConnection(),
    fields: {
      serviceAccountFile: {
        validateAsync: async file => {
          if (!file) {
            return undefined;
          }
          try {
            const key: unknown = JSON.parse(await file.text());
            if (
              key &&
              typeof key === 'object' &&
              'type' in key &&
              key.type === 'service_account' &&
              'private_key' in key &&
              typeof key.private_key === 'string' &&
              'client_email' in key &&
              typeof key.client_email === 'string'
            ) {
              return undefined;
            }
          } catch {
            return { type: 'error', message: m.invalidKey };
          }
          return { type: 'error', message: m.invalidKey };
        },
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
    onSubmit: values => (canSave ? data.onSaveConnection(kind, values, id) : Promise.resolve(undefined)),
    onSuccess: connection => send(connection ? { type: 'SAVED', connection } : { type: 'NEXT' }),
    errorFallback: m.saveError,
  });
  const matchingSsoConnections = data.connections.filter(
    connection => connection.kind === 'sso' && connection.configuration.provider === form.values.provider,
  );
  const pending = form.isSubmitting || test.isPending;
  const canContinue =
    !pending &&
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
    editing: id !== undefined,
    kind,
    step: state.value,
    progress: state.value === 'provider' ? 1 : ['test', 'roles', 'saved', 'complete'].includes(state.value) ? 3 : 2,
    direction: state.context.direction,
    result,
    directoryStep: Math.max(1, ['configure', 'attributes', 'test', 'roles'].indexOf(state.value) + 1),
    tokenVisible: state.context.tokenVisible,
    onRevealToken: () => send({ type: 'REVEAL_TOKEN' }),
    test,
    pending,
    canContinue,
    canSave,
    open: (nextKind: ConnectionKind, connection?: AccessConnection) => {
      form.reset(connection?.configuration ?? { ...newConnection(), name: m.providers.okta });
      test.reset();
      send({ type: 'START', kind: nextKind, id: connection?.id });
      if (connection) {
        send({ type: 'NEXT' });
      }
    },
    onProvider: (provider: AccessProvider) => {
      if (provider === form.values.provider) {
        return;
      }
      test.reset();
      send({ type: 'START', kind, id });
      form.reset({ ...newConnection(), provider, name: m.providers[provider] });
      form.setValue('name', m.providers[provider]);
    },
    onServiceAccount: (file: File | null) => {
      form.setValue('serviceAccountFile', file);
      form.touch('serviceAccountFile');
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
        const result = await data.onTestConnection(kind, form.values);
        send({ type: 'TESTED', result });
      });
    },
  };
}
export type AccessConnectionController = ReturnType<typeof useAccessConnectionController>;
