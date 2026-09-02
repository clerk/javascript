import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkAPIResponseError } from '@/error';

import { INTERNAL_STABLE_KEYS } from '../../stable-keys';
import { createCacheKeys } from '../createCacheKeys';
import { __internal_useOrganizationDirectorySync } from '../useOrganizationDirectorySync';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const directory = { id: 'dir_1', enterpriseConnectionId: 'ent_1' };
const getDirectorySyncSpy = vi.fn((_enterpriseConnectionId: string) => Promise.resolve(directory));

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: null,
    organization: { id: 'org_1', getDirectorySync: getDirectorySyncSpy },
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
});
