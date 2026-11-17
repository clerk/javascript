import type { FormEvent } from 'react';
import { useState } from 'react';

import { useForm } from '../../../components/form';
import { usePendingAction } from '../../../hooks/use-pending-action';
import type { ErrorDescription } from '../../../localization';
import { useErrorText, useLocale, useMessages } from '../../../localization';
import { setup } from '../../../machine/setup';
import type { DoneInvokeEvent } from '../../../machine/types';
import { useMachine } from '../../../machine/use-machine';
import { toLocalizableError } from '../../../utils/errors';
import { formatDate } from '../../../utils/format-date';
import type { AccessConnection, AccessData, ConnectionTestResult } from './access.types';
import { isServiceAccountFile, newConnection } from './access.utils';

interface TestRun {
  id: string;
  date: Date;
  result: ConnectionTestResult;
}

interface EditContext {
  history: Record<string, TestRun[]>;
  latest: ConnectionTestResult | null;
  error: ErrorDescription | undefined;
  run: () => Promise<{ connectionId: string; run: TestRun } | undefined>;
}
type EditEvent =
  | { type: 'OPEN' }
  | { type: 'STARTED' }
  | { type: 'NEXT'; name: string }
  | { type: 'BACK' }
  | { type: 'TEST'; run: EditContext['run'] };
const { createMachine, assign, fromPromise } = setup<EditContext, EditEvent>();
const testConnection = {
  target: 'testing' as const,
  actions: assign((_: EditContext, event: Extract<EditEvent, { type: 'TEST' }>) => ({
    run: event.run,
    error: undefined,
  })),
};
const editConnectionMachine = createMachine({
  initial: 'settings',
  context: { history: {}, latest: null, error: undefined, run: () => Promise.resolve(undefined) },
  states: {
    settings: {
      on: {
        OPEN: { actions: assign(() => ({ error: undefined, latest: null })) },
        STARTED: { actions: assign(() => ({ latest: null })) },
        NEXT: { target: 'test', guard: (_, event) => Boolean(event.name.trim()) },
        TEST: testConnection,
      },
    },
    test: {
      on: {
        OPEN: { target: 'settings', actions: assign(() => ({ error: undefined, latest: null })) },
        STARTED: { actions: assign(() => ({ latest: null })) },
        BACK: 'settings',
        TEST: testConnection,
      },
    },
    testing: {
      invoke: fromPromise(context => context.run(), {
        onDone: {
          target: 'test',
          actions: assign((context, event: DoneInvokeEvent<Awaited<ReturnType<EditContext['run']>>>) => {
            if (!event.output) {
              return {};
            }
            const { connectionId, run } = event.output;
            if (run.result.pending) {
              return { latest: run.result };
            }
            const previous = context.history[connectionId] ?? [];
            return {
              latest: run.result,
              history: { ...context.history, [connectionId]: [run, ...previous.filter(item => item.id !== run.id)] },
            };
          }),
        },
        onError: { target: 'test', actions: assign((_, event) => ({ error: toLocalizableError(event.error) })) },
      }),
    },
  },
});

export function useAccessManageConnectionController(
  data: AccessData,
  connection: AccessConnection | null,
  onClose: () => void,
) {
  const m = useMessages('organizationProfile').access;
  const locale = useLocale();
  const [editingSettings, setEditingSettings] = useState(false);
  const [token, setToken] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [state, send, actor] = useMachine(editConnectionMachine);
  const history = state.context.history;
  const testing = state.value === 'testing';
  const errorText = useErrorText();
  const testError = state.context.error ? errorText(state.context.error, m.testError) : undefined;
  const actions = usePendingAction<'token' | 'start'>({ errorFallback: m.testError });
  const form = useForm({
    initialValues: newConnection(),
    fields: {
      serviceAccountFile: {
        validateAsync: async file =>
          file && !(await isServiceAccountFile(file)) ? { type: 'error', message: m.invalidKey } : undefined,
      },
    },
    canSubmit: values => connection !== null && !actions.isPending && !testing && Boolean(values.name.trim()),
    onSubmit: async values => {
      if (!form.isDirty || !connection || !data.onSaveConnection) {
        return false;
      }
      await data.onSaveConnection(connection.kind, { ...values, name: values.name.trim() }, connection.id);
      return true;
    },
    onSuccess: saved => {
      if (saved) {
        onClose();
      }
    },
    errorFallback: m.saveError,
  });
  const pending = form.isSubmitting || actions.isPending || testing;
  const runs = connection ? (history[connection.id] ?? []) : [];
  const result = state.context.latest ?? undefined;
  const groups = [...new Set([...Object.keys(form.values.groupRoles), ...(result?.groups ?? [])])];

  return {
    form,
    pending,
    policyStep: state.value === 'settings' ? ('settings' as const) : ('test' as const),
    canContinuePolicy: !pending && actor.can({ type: 'NEXT', name: form.values.name }),
    onPolicySubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!pending) {
        send({ type: 'NEXT', name: form.values.name });
      }
    },
    onPolicyBack: () => {
      if (!pending) {
        send({ type: 'BACK' });
      }
    },
    editingSettings,
    token,
    testUrl,
    onStartTest:
      data.onStartSsoTest && connection?.kind === 'sso'
        ? () => {
            const start = data.onStartSsoTest;
            if (start) {
              void actions.run('start', async () => {
                setTestUrl(await start(connection.id));
                send({ type: 'STARTED' });
              });
            }
          }
        : undefined,
    result,
    live: data.live,
    roleRows: [
      ...(form.values.syncGroups ? groups.map((group, index) => ({ group, priority: index + 1 })) : []),
      ...(!data.live ? [{ group: null, priority: null }] : []),
    ],
    runs: runs.map(run => ({
      id: run.id,
      date: formatDate(run.date, locale),
      detail: run.result.email,
      success: run.result.success,
    })),
    error: testError ?? actions.error,
    testing,
    canGenerateToken: data.directoryReadyToRotate !== false,
    generatingToken: actions.pendingKey === 'token',
    open: (item: AccessConnection) => {
      send({ type: 'OPEN' });
      setTestUrl('');
      form.reset(item.configuration);
      actions.reset();
      setEditingSettings(false);
      setToken('');
    },
    onClose: () => {
      if (!pending) {
        onClose();
      }
    },
    onEditSettings: () => setEditingSettings(open => !open),
    onModeChange: (value: string) => {
      if (value === 'metadata' || value === 'file' || value === 'manual') {
        form.setValue('mode', value);
      }
    },
    onTest: () => {
      if (!connection || pending) {
        return;
      }
      send({
        type: 'TEST',
        run: async () => {
          const result = await data.onTestConnection?.(connection.kind, form.values, connection.id);
          if (!result) {
            return undefined;
          }
          const date = new Date(result.createdAt ?? Date.now());
          return { connectionId: connection.id, run: { id: result.id ?? String(runs.length), date, result } };
        },
      });
    },
    onGenerateToken: () => {
      if (connection?.kind !== 'directory' || pending) {
        return;
      }
      void actions.run(
        'token',
        async () => {
          const token = await data.onRotateDirectoryToken?.(connection.id);
          if (token !== undefined) {
            setToken(token);
          }
        },
        {
          errorFallback: m.rotateTokenError,
        },
      );
    },
  };
}

export type AccessManageConnectionController = ReturnType<typeof useAccessManageConnectionController>;
