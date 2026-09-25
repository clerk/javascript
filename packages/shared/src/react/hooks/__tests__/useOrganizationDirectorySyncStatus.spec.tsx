import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DirectorySyncResource } from '@/types/directorySync';

import { __internal_useOrganizationDirectorySyncStatus } from '../useOrganizationDirectorySyncStatus';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const POLL_INTERVAL_MS = 20;

const getSyncStatusSpy = vi.fn(() =>
  Promise.resolve({ lastSyncedAt: new Date(1700000000000), lastSyncStatus: 'succeeded', lastSyncError: null }),
);

const createDirectory = (id: string, organizationId = 'org_1') =>
  ({
    id,
    organizationId,
    enterpriseConnectionId: 'ent_1',
    getSyncStatus: getSyncStatusSpy,
  }) as unknown as DirectorySyncResource;

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: null,
    organization: { id: 'org_1' },
    client: null,
  },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
  useInitialStateContext: () => undefined,
}));

type RenderProps = { directory: DirectorySyncResource | null; poll?: boolean };

const renderStatus = (initialProps: RenderProps) =>
  renderHook(
    ({ directory, poll }: RenderProps) =>
      __internal_useOrganizationDirectorySyncStatus({ directory, poll, pollIntervalMs: POLL_INTERVAL_MS }),
    { wrapper, initialProps },
  );

describe('useOrganizationDirectorySyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('stays dormant without a directory', () => {
    const { result } = renderStatus({ directory: null, poll: true });

    expect(getSyncStatusSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPolling).toBe(false);
  });

  it('reads the last sync result once a directory is present', async () => {
    const { result } = renderStatus({ directory: createDirectory('dir_1') });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(getSyncStatusSpy).toHaveBeenCalled();
    expect(result.current.data?.lastSyncStatus).toBe('succeeded');
    expect(result.current.isPolling).toBe(false);
  });

  it('polls while armed', async () => {
    const { result } = renderStatus({ directory: createDirectory('dir_1'), poll: true });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.isPolling).toBe(true);

    const callsAfterFirstLoad = getSyncStatusSpy.mock.calls.length;
    await waitFor(() => expect(getSyncStatusSpy.mock.calls.length).toBeGreaterThan(callsAfterFirstLoad));
  });

  it('refuses a directory belonging to another organization', async () => {
    const { result } = renderStatus({ directory: createDirectory('dir_other', 'org_2') });

    // The cache key is built from the context organization, so reading a
    // foreign directory would file its result under this organization.
    expect(getSyncStatusSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPolling).toBe(false);
  });

  it('does not carry one directory status onto another', async () => {
    const { result, rerender } = renderStatus({ directory: createDirectory('dir_1') });

    await waitFor(() => expect(result.current.data).toBeDefined());

    // A different directory must not momentarily report the previous one's run.
    // "Never synced" and "synced an hour ago" drive different UI.
    getSyncStatusSpy.mockImplementationOnce(() => new Promise<never>(() => {}));
    rerender({ directory: createDirectory('dir_2') });

    expect(result.current.data).toBeUndefined();
  });
});
