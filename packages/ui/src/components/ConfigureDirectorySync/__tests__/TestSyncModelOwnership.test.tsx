import type { DirectorySyncResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';

import type { ConfigureDirectorySyncData } from '../configure-directory-sync.types';
import { useConfigureDirectorySyncContextModel } from '../configure-directory-sync-context.model';
import { useTestSyncStepModel } from '../steps/test-sync-step.model';

const { context } = vi.hoisted(() => ({ context: vi.fn() }));
vi.mock('../ConfigureDirectorySyncContext', async original => ({
  ...(await original<typeof import('../ConfigureDirectorySyncContext')>()),
  useConfigureDirectorySync: context,
}));
const { createFixtures } = bindCreateFixtures('OrganizationProfile');
const setup = async (resourceOverrides = {}, contextOverrides: Partial<ConfigureDirectorySyncData> = {}) => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const organization = fixtures.clerk.organization!;
  const directory = {
    id: 'directory_1',
    organizationId: organization.id,
    enterpriseConnectionId: 'connection_1',
    provider: 'google',
    endpointUrl: 'https://example.com/scim',
    attributeMapping: {},
    credentialsConfigured: true,
    apiKey: 'secret',
    getUsers: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'user_1',
          identifier: 'alice@example.com',
          active: true,
          firstName: 'Alice',
          lastName: 'Clerk',
          provisionedAt: new Date(1),
          delete: vi.fn(),
        },
      ],
      total_count: 1,
    }),
    getSyncStatus: vi.fn().mockResolvedValue({
      lastSyncStatus: 'success',
      lastSyncedAt: new Date(1),
      lastSyncError: null,
      lastSyncChangedUserCount: 0,
    }),
    ...resourceOverrides,
  };
  organization.getEnterpriseConnections.mockResolvedValue([
    {
      id: 'connection_1',
      name: 'Acme',
      active: true,
      domains: [],
      provider: 'saml_google',
    } as unknown as EnterpriseConnectionResource,
  ]);
  organization.getDirectorySync.mockResolvedValue(directory as unknown as DirectorySyncResource);
  const hook = renderHook(
    ({ overrides }) => {
      const source = useConfigureDirectorySyncContextModel();
      context.mockReturnValue({ ...source, revealedToken: null, ...overrides });
      return { source, model: useTestSyncStepModel() };
    },
    { wrapper, initialProps: { overrides: contextOverrides } },
  );
  await waitFor(() => expect(hook.result.current.source.isLoading).toBe(false));
  return { ...hook, directory, fixtures };
};

describe('Directory Sync test model ownership', () => {
  it.each([{ organizationId: 'other_organization' }, { enterpriseConnectionId: 'other_connection' }])(
    'does not poll a cached directory outside the selected owner: %j',
    async overrides => {
      const { directory, result } = await setup(overrides);
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
      expect(result.current.model.rows).toEqual([]);
    },
  );

  it('does not poll a directory that differs from the context selection', async () => {
    const { directory, result } = await setup(
      {},
      { directory: { id: 'directory_2', endpointUrl: '', attributeMapping: {}, credentialsConfigured: true } },
    );
    expect(directory.getUsers).not.toHaveBeenCalled();
    expect(directory.getSyncStatus).not.toHaveBeenCalled();
    expect(result.current.model.rows).toEqual([]);
  });

  it('does not poll after source directory ownership is lost', async () => {
    const { directory } = await setup({}, { canRunDirectory: () => false });
    expect(directory.getUsers).not.toHaveBeenCalled();
    expect(directory.getSyncStatus).not.toHaveBeenCalled();
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks retained refreshes after canonical %s changes before render',
    async field => {
      const { result, directory, fixtures } = await setup();
      await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
      const retained = result.current.model;
      directory.getUsers.mockClear();
      directory.getSyncStatus.mockClear();
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'other' } as never);
      await act(async () => {
        await retained.revalidateUsers();
        await retained.revalidateStatus();
      });
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
    },
  );

  it('does not revive a retained refresh when an earlier directory epoch returns', async () => {
    const { result, rerender, directory } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    const retained = result.current.model;
    rerender({ overrides: { directoryKey: 'another_epoch' } });
    rerender({ overrides: {} });
    directory.getUsers.mockClear();
    directory.getSyncStatus.mockClear();
    await act(async () => {
      await retained.revalidateUsers();
      await retained.revalidateStatus();
    });
    expect(directory.getUsers).not.toHaveBeenCalled();
    expect(directory.getSyncStatus).not.toHaveBeenCalled();
  });

  it('returns display data and permits a current refresh', async () => {
    const { result, directory } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    expect(result.current.model.rows[0]).toEqual({
      id: 'user_1',
      identifier: 'alice@example.com',
      displayName: 'Alice Clerk',
      active: true,
      provisionedAt: new Date(1).toLocaleString(),
    });
    directory.getUsers.mockClear();
    await act(async () => {
      await result.current.model.revalidateUsers();
    });
    expect(directory.getUsers).toHaveBeenCalledTimes(1);
    expect(result.current.model).not.toHaveProperty('directory');
    expect(result.current.model).not.toHaveProperty('apiKey');
  });
  it.each(['user', 'session', 'client', 'organization'] as const)(
    'does not poll after canonical %s changes before render',
    async field => {
      const { result, directory, fixtures, unmount, rerender } = await setup();
      await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
      vi.useFakeTimers({ shouldClearNativeTimers: true });
      try {
        rerender({ overrides: { directoryKey: 'poll_epoch' } });
        await act(async () => {
          await result.current.model.revalidateUsers();
          await result.current.model.revalidateStatus();
        });
        directory.getUsers.mockClear();
        directory.getSyncStatus.mockClear();
        vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field]!, id: 'other' } as never);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2_000);
        });
        expect(directory.getUsers).not.toHaveBeenCalled();
        expect(directory.getSyncStatus).not.toHaveBeenCalled();
      } finally {
        unmount();
        vi.useRealTimers();
      }
    },
  );

  it('does not poll after the context closes before unmount', async () => {
    const canRunDirectory = vi.fn(() => true);
    const { result, directory, unmount, rerender } = await setup({}, { canRunDirectory });
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch', canRunDirectory } });
      await act(async () => {
        await result.current.model.revalidateUsers();
        await result.current.model.revalidateStatus();
      });
      directory.getUsers.mockClear();
      directory.getSyncStatus.mockClear();
      canRunDirectory.mockReturnValue(false);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });
  it('polls current users and pull status every two seconds', async () => {
    const { result, directory, unmount, rerender } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      directory.getUsers.mockClear();
      directory.getSyncStatus.mockClear();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_999);
      });
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(1);
      expect(directory.getSyncStatus).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(2);
      expect(directory.getSyncStatus).toHaveBeenCalledTimes(2);
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('pauses network reads in a hidden document and resumes when visible', async () => {
    const { result, directory, unmount, rerender } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      directory.getUsers.mockClear();
      directory.getSyncStatus.mockClear();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
      visibility.mockReturnValue('visible');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(1);
      expect(directory.getSyncStatus).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
      visibility.mockRestore();
      vi.useRealTimers();
    }
  });

  it('polls users without status for a push directory', async () => {
    const { result, directory, unmount, rerender } = await setup({ provider: 'okta' });
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      directory.getUsers.mockClear();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(1);
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('clears polling timers when the test model unmounts', async () => {
    const { result, directory, unmount, rerender } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      directory.getUsers.mockClear();
      directory.getSyncStatus.mockClear();
      unmount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4_000);
      });
      expect(directory.getUsers).not.toHaveBeenCalled();
      expect(directory.getSyncStatus).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
  it('does not restart a slow polling request', async () => {
    const { result, directory, unmount, rerender } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    const request = createDeferredPromise<{ data: []; total_count: number }>();
    directory.getUsers.mockReturnValue(request.promise);
    directory.getUsers.mockClear();
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4_000);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(1);
      await act(async () => {
        request.resolve({ data: [], total_count: 0 });
        await request.promise;
      });
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('does not interrupt a pending manual refresh with a poll', async () => {
    const { result, directory, unmount, rerender } = await setup();
    await waitFor(() => expect(result.current.model.rows).toHaveLength(1));
    const request = createDeferredPromise<{ data: []; total_count: number }>();
    directory.getUsers.mockReturnValue(request.promise);
    directory.getUsers.mockClear();
    vi.useFakeTimers({ shouldClearNativeTimers: true });
    try {
      rerender({ overrides: { directoryKey: 'poll_epoch' } });
      let completion!: Promise<void>;
      await act(async () => {
        completion = result.current.model.revalidateUsers();
        await Promise.resolve();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4_000);
      });
      expect(directory.getUsers).toHaveBeenCalledTimes(1);
      await act(async () => {
        request.resolve({ data: [], total_count: 0 });
        await completion;
      });
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });
});
