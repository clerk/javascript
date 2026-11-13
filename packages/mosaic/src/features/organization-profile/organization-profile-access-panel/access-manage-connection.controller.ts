import { useState } from 'react';

import { useForm } from '../../../components/form';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useLocale, useMessages } from '../../../localization';
import { keysOf } from '../../../primitives/utils/object';
import { formatDate } from '../../../utils/format-date';
import type { AccessConnection, AccessData, ConnectionTestResult } from './access.types';
import { isServiceAccountFile, newConnection } from './access.utils';

interface TestRun {
  id: string;
  date: Date;
  result: ConnectionTestResult;
}

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
  const [history, setHistory] = useState<Record<string, TestRun[]>>({});
  const actions = usePendingAction<'test' | 'token' | 'start'>({ errorFallback: m.testError });
  const form = useForm({
    initialValues: newConnection(),
    fields: {
      serviceAccountFile: {
        validateAsync: async file =>
          file && !(await isServiceAccountFile(file)) ? { type: 'error', message: m.invalidKey } : undefined,
      },
    },
    canSubmit: values =>
      connection !== null &&
      !actions.isPending &&
      Boolean(values.name.trim()) &&
      keysOf(values).some(key => !Object.is(values[key], connection.configuration[key])),
    onSubmit: async values => {
      if (!connection || !data.onSaveConnection) {
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
  const pending = form.isSubmitting || actions.isPending;
  const runs = connection ? (history[connection.id] ?? []) : [];
  const result = runs[0]?.result;
  const groups = [...new Set([...Object.keys(form.values.groupRoles), ...(result?.groups ?? [])])];

  return {
    form,
    pending,
    editingSettings,
    token,
    testUrl,
    onStartTest:
      data.onStartSsoTest && connection?.kind === 'sso'
        ? () => {
            const start = data.onStartSsoTest;
            if (start) {
              void actions.run('start', async () => setTestUrl(await start(connection.id)));
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
    error: actions.error,
    testing: actions.pendingKey === 'test' || actions.pendingKey === 'start',
    canGenerateToken: data.directoryReadyToRotate !== false,
    generatingToken: actions.pendingKey === 'token',
    open: (item: AccessConnection) => {
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
      void actions.run('test', async () => {
        const result = await data.onTestConnection?.(connection.kind, form.values, connection.id);
        if (!result) {
          return;
        }
        if (result.pending) {
          return;
        }
        const date = new Date(result.createdAt ?? Date.now());
        setHistory(current => {
          const previous = current[connection.id] ?? [];
          return {
            ...current,
            [connection.id]: [{ id: result.id ?? String(previous.length), date, result }, ...previous],
          };
        });
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
