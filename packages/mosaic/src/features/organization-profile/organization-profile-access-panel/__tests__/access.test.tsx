import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { MosaicProvider } from '../../../../mosaic-provider';
import { useAccessController } from '../access.controller';
import type { AccessConnection, AccessData } from '../access.types';
import { canActivatePolicy, newConnection, newPolicy } from '../access.utils';

const wrapper = ({ children }: PropsWithChildren) => <MosaicProvider>{children}</MosaicProvider>;
const connection: AccessConnection = {
  id: 'sso_one',
  kind: 'sso',
  configuration: { ...newConnection(), name: 'Engineering', metadataUrl: 'https://example.com/metadata' },
};
const serviceProvider = {
  signOnUrl: '',
  audience: '',
  redirectUri: '',
  scimUrl: '',
  token: '',
  dnsValue: '',
  testUrl: '',
};

function renderAccess(overrides: Partial<AccessData> = {}) {
  const onSavePolicy = vi.fn().mockResolvedValue(undefined);
  const onSaveConnection = overrides.onSaveConnection ?? vi.fn().mockResolvedValue(connection);
  const hook = renderHook(
    () => {
      const [connections, setConnections] = useState<AccessConnection[]>([]);
      return useAccessController({
        policies: [],
        connections,
        serviceProvider,
        onSavePolicy,
        onTestConnection: () => Promise.resolve({ success: true, email: 'person@example.com' }),
        onVerifyDomain: () => Promise.resolve(true),
        ...overrides,
        onSaveConnection: async (...args) => {
          const saved = await onSaveConnection(...args);
          setConnections(current => [...current, saved]);
          return saved;
        },
      });
    },
    { wrapper },
  );
  return { ...hook, onSavePolicy, onSaveConnection };
}

async function prepareSso(result: ReturnType<typeof renderAccess>['result']) {
  act(() => result.current.onSetup('sso'));
  act(() => result.current.wizard.onProvider('okta'));
  expect(result.current.wizard.step).toBe('provider');
  act(() => result.current.wizard.onContinue());
  act(() => result.current.wizard.form.setValue('metadataUrl', 'https://example.com/metadata'));
  act(() => result.current.wizard.onContinue());
  await waitFor(() => expect(result.current.wizard.step).toBe('attributes'));
  act(() => result.current.wizard.onContinue());
  act(() => result.current.wizard.onContinue());
  act(() => result.current.wizard.onContinue());
  await waitFor(() => expect(result.current.wizard.step).toBe('test'));
  act(() => result.current.wizard.onTest());
  await waitFor(() => expect(result.current.wizard.result?.success).toBe(true));
}

describe('Access drafts and connection setup', () => {
  it('adds a connection to the catalog, then attaches it once to the current draft on Continue', async () => {
    const { result, onSavePolicy } = renderAccess();
    act(() => result.current.onEdit());
    act(() => result.current.form.setValue('domains', [{ name: 'example.com', verified: true }]));
    act(() => result.current.form.setValue('enrollment', 'request'));
    await prepareSso(result);
    act(() => result.current.wizard.onContinue());
    await waitFor(() => expect(result.current.wizard.step).toBe('saved'));
    expect(result.current.data.connections).toEqual([connection]);
    expect(result.current.form.values.ssoConnectionIds).toEqual([]);
    act(() => result.current.wizard.onContinue());
    act(() => result.current.wizard.onContinue());
    expect(result.current.form.values.ssoConnectionIds).toEqual(['sso_one']);
    expect(result.current.form.values.enrollment).toBe('request');
    expect(result.current.form.values.domains).toEqual([{ name: 'example.com', verified: true }]);
    expect(result.current.request).toBeNull();
    expect(onSavePolicy).not.toHaveBeenCalled();
    act(() => result.current.onSaveDraft());
    await waitFor(() =>
      expect(onSavePolicy).toHaveBeenCalledWith(
        expect.objectContaining({ ssoConnectionIds: ['sso_one'], status: 'draft' }),
      ),
    );
  });

  it('keeps a saved connection when setup closes without attaching it or saving a policy', async () => {
    const { result, onSavePolicy } = renderAccess();
    act(() => result.current.onEdit());
    await prepareSso(result);
    act(() => result.current.wizard.onContinue());
    await waitFor(() => expect(result.current.wizard.step).toBe('saved'));
    act(() => result.current.wizard.onOpenChange(false));
    act(() => result.current.onBack());
    expect(result.current.data.connections).toEqual([connection]);
    expect(result.current.form.values.ssoConnectionIds).toEqual([]);
    expect(onSavePolicy).not.toHaveBeenCalled();
  });

  it('blocks dismissal during a save and retains the form after a failed save', async () => {
    const save = deferred<AccessConnection>();
    const { result } = renderAccess({ onSaveConnection: () => save.promise });
    await prepareSso(result);
    act(() => result.current.wizard.onContinue());
    await waitFor(() => expect(result.current.wizard.pending).toBe(true));
    act(() => result.current.wizard.onOpenChange(false));
    expect(result.current.request).not.toBeNull();
    act(() => save.reject(new Error('Offline')));
    await waitFor(() => expect(result.current.wizard.form.error).toBeTruthy());
    expect(result.current.wizard.form.values.metadataUrl).toBe('https://example.com/metadata');
    expect(result.current.data.connections).toEqual([]);
    expect(result.current.wizard.canContinue).toBe(true);
  });

  it('returns a directory to the same draft after configuration, mapping, and a successful test', async () => {
    const directory: AccessConnection = {
      id: 'directory_one',
      kind: 'directory',
      configuration: { ...newConnection(), name: 'Directory', ssoConnectionId: 'sso_one' },
    };
    const { result } = renderAccess({ connections: [connection], onSaveConnection: () => Promise.resolve(directory) });
    act(() => result.current.onEdit());
    act(() => result.current.form.setValue('enrollment', 'directory'));
    act(() => result.current.onSetup('directory'));
    act(() => result.current.wizard.onProvider('okta'));
    expect(result.current.wizard.step).toBe('provider');
    act(() => result.current.wizard.onContinue());
    expect(result.current.wizard.form.values.ssoConnectionId).toBe('sso_one');
    expect(result.current.wizard.canContinue).toBe(true);
    act(() => result.current.wizard.onContinue());
    await waitFor(() => expect(result.current.wizard.step).toBe('attributes'));
    act(() => result.current.wizard.onContinue());
    expect(result.current.wizard.canContinue).toBe(false);
    act(() => result.current.wizard.onTest());
    await waitFor(() => expect(result.current.wizard.result?.success).toBe(true));
    act(() => result.current.wizard.onContinue());
    act(() => result.current.wizard.onContinue());
    await waitFor(() => expect(result.current.wizard.step).toBe('saved'));
    act(() => result.current.wizard.onContinue());
    expect(result.current.form.values.directoryConnectionId).toBe('directory_one');
    expect(result.current.form.values.enrollment).toBe('directory');
    expect(result.current.step).toBe('editor');
  });

  it('does not permit activation with an unverified SSO domain or a missing connection', () => {
    const policy = {
      ...newPolicy(),
      authentication: 'sso' as const,
      domains: [{ name: 'example.com', verified: false }],
      ssoConnectionIds: ['sso_one'],
    };
    expect(canActivatePolicy(policy, [connection])).toBe(false);
    policy.domains[0].verified = true;
    expect(canActivatePolicy(policy, [])).toBe(false);
    expect(canActivatePolicy(policy, [connection])).toBe(true);
    expect(canActivatePolicy({ ...policy, enrollment: 'directory' }, [connection])).toBe(false);
  });
});
