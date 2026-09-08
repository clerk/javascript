import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkAPIResponseError } from '@/error';

import { INTERNAL_STABLE_KEYS } from '../../stable-keys';
import { createCacheKeys } from '../createCacheKeys';
import { __internal_useOrganizationDirectorySync } from '../useOrganizationDirectorySync';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const updateSpy = vi.fn(() => Promise.resolve({ ...directory, name: 'Renamed' }));
const rotateTokenSpy = vi.fn(() => Promise.resolve({ ...directory, token: 'tok_new' }));
const deleteSpy = vi.fn(() => Promise.resolve({ object: 'directory', id: 'dir_1', deleted: true }));
const directory = {
  id: 'dir_1',
  enterpriseConnectionId: 'ent_1',
  update: updateSpy,
  rotateToken: rotateTokenSpy,
  delete: deleteSpy,
};
const getDirectorySyncSpy = vi.fn((_enterpriseConnectionId: string) => Promise.resolve(directory));
const createDirectorySyncSpy = vi.fn((_enterpriseConnectionId: string, _params?: unknown) =>
  Promise.resolve({ ...directory, token: 'tok_1' }),
);

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: null,
    organization: { id: 'org_1', getDirectorySync: getDirectorySyncSpy, createDirectorySync: createDirectorySyncSpy },
    client: null,
  },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
  useInitialStateContext: () => undefined,
}));

const keysFor = (enterpriseConnectionId: string) =>
  createCacheKeys({
    stablePrefix: INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_KEY,
    authenticated: true,
    tracked: { organizationId: 'org_1', enterpriseConnectionId },
    untracked: { args: {} },
  });

const renderDirectorySync = (enterpriseConnectionId: string | null = 'ent_1') =>
  renderHook(() => __internal_useOrganizationDirectorySync({ enterpriseConnectionId }), { wrapper });

describe('useOrganizationDirectorySync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('resolves the directory for the connection', async () => {
    const { result } = renderDirectorySync();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getDirectorySyncSpy).toHaveBeenCalledWith('ent_1');
    expect(result.current.data).toBe(directory);
    expect(result.current.error).toBeNull();
  });

  it('treats a 404 as "no directory yet" and resolves null instead of an error', async () => {
    getDirectorySyncSpy.mockRejectedValueOnce(new ClerkAPIResponseError('Not found', { status: 404, data: [] }));

    const { result } = renderDirectorySync();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('stays dormant without an enterprise connection id', () => {
    const { result } = renderDirectorySync(null);

    expect(getDirectorySyncSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('revalidate refetches only this org+connection, leaving other connections cached', async () => {
    const { queryKey: otherKey } = keysFor('ent_other');
    defaultQueryClient.client.setQueryData(otherKey, { id: 'dir_other', enterpriseConnectionId: 'ent_other' });

    const { result } = renderDirectorySync();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getDirectorySyncSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.revalidate();
    });

    expect(getDirectorySyncSpy).toHaveBeenCalledTimes(2);
    expect(defaultQueryClient.client.getQueryState(otherKey)?.isInvalidated).toBe(false);
  });

  describe('mutations', () => {
    it('createDirectorySync creates for the connection, resolves the token-bearing resource, and refetches', async () => {
      const { result } = renderDirectorySync();
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(1);

      let created: Awaited<ReturnType<typeof result.current.createDirectorySync>>;
      await act(async () => {
        created = await result.current.createDirectorySync({ name: 'Okta' });
      });

      expect(createDirectorySyncSpy).toHaveBeenCalledWith('ent_1', { name: 'Okta' });
      expect(created).toMatchObject({ id: 'dir_1', token: 'tok_1' });
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(2);
    });

    it('createDirectorySync is a no-op without an enterprise connection id', async () => {
      const { result } = renderDirectorySync(null);

      await expect(result.current.createDirectorySync()).resolves.toBeUndefined();
      expect(createDirectorySyncSpy).not.toHaveBeenCalled();
    });

    it.each([
      [
        'updateDirectorySync',
        updateSpy,
        (r: ReturnType<typeof renderDirectorySync>['result']) => r.current.updateDirectorySync({ name: 'Renamed' }),
      ],
      [
        'rotateDirectorySyncToken',
        rotateTokenSpy,
        (r: ReturnType<typeof renderDirectorySync>['result']) => r.current.rotateDirectorySyncToken(),
      ],
      [
        'deleteDirectorySync',
        deleteSpy,
        (r: ReturnType<typeof renderDirectorySync>['result']) => r.current.deleteDirectorySync(),
      ],
    ] as const)('%s acts on the loaded directory and refetches it', async (_name, resourceSpy, run) => {
      const { result } = renderDirectorySync();
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(1);

      let resolved: unknown;
      await act(async () => {
        resolved = await run(result);
      });

      expect(resourceSpy).toHaveBeenCalledTimes(1);
      expect(resolved).toBe(await resourceSpy.mock.results[0].value);
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(2);
    });

    it('updateDirectorySync forwards its params to the resource', async () => {
      const { result } = renderDirectorySync();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateDirectorySync({ name: 'Renamed' });
      });

      expect(updateSpy).toHaveBeenCalledWith({ name: 'Renamed' });
    });

    it('directory-scoped mutations resolve undefined before the directory has loaded', async () => {
      getDirectorySyncSpy.mockRejectedValueOnce(new ClerkAPIResponseError('Not found', { status: 404, data: [] }));
      const { result } = renderDirectorySync();
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeNull();

      await expect(result.current.updateDirectorySync({ name: 'Renamed' })).resolves.toBeUndefined();
      await expect(result.current.rotateDirectorySyncToken()).resolves.toBeUndefined();
      await expect(result.current.deleteDirectorySync()).resolves.toBeUndefined();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(rotateTokenSpy).not.toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('propagates a failed mutation and skips the refetch', async () => {
      const { result } = renderDirectorySync();
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(1);

      const failure = new Error('rotate failed');
      rotateTokenSpy.mockRejectedValueOnce(failure);

      await expect(result.current.rotateDirectorySyncToken()).rejects.toBe(failure);
      expect(getDirectorySyncSpy).toHaveBeenCalledTimes(1);
    });
  });
});
