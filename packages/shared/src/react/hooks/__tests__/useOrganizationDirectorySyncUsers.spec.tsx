import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DirectorySyncResource } from '@/types/directorySync';

import { __internal_useOrganizationDirectorySyncUsers } from '../useOrganizationDirectorySyncUsers';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const POLL_INTERVAL_MS = 20;

const getUsersSpy = vi.fn(() => Promise.resolve({ data: [{ id: 'du_1' }], total_count: 1 }));

const createDirectory = (id: string) =>
  ({ id, enterpriseConnectionId: 'ent_1', getUsers: getUsersSpy }) as unknown as DirectorySyncResource;

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

const renderUsers = (initialProps: RenderProps) =>
  renderHook(
    ({ directory, poll }: RenderProps) =>
      __internal_useOrganizationDirectorySyncUsers({ directory, poll, pollIntervalMs: POLL_INTERVAL_MS }),
    { wrapper, initialProps },
  );

describe('useOrganizationDirectorySyncUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('stays dormant without a directory', () => {
    const { result } = renderUsers({ directory: null, poll: true });

    expect(getUsersSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPolling).toBe(false);
  });

  it('does not poll by default', async () => {
    const { result } = renderUsers({ directory: createDirectory('dir_1') });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPolling).toBe(false);

    const callsAfterLoad = getUsersSpy.mock.calls.length;
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS * 3));
    expect(getUsersSpy.mock.calls.length).toBe(callsAfterLoad);
  });

  it('polls while `poll` is true and stops when it turns false', async () => {
    const directory = createDirectory('dir_1');
    const { result, rerender } = renderUsers({ directory, poll: true });
    expect(result.current.isPolling).toBe(true);
    await waitFor(() => expect(getUsersSpy.mock.calls.length).toBeGreaterThanOrEqual(3));

    rerender({ directory, poll: false });
    expect(result.current.isPolling).toBe(false);

    const callsAfterStop = getUsersSpy.mock.calls.length;
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS * 3));
    expect(getUsersSpy.mock.calls.length).toBe(callsAfterStop);
  });

  it('stops polling on unmount', async () => {
    const { result, unmount } = renderUsers({ directory: createDirectory('dir_1'), poll: true });
    await waitFor(() => expect(getUsersSpy.mock.calls.length).toBeGreaterThanOrEqual(3));
    expect(result.current.isPolling).toBe(true);

    unmount();

    const callsAfterUnmount = getUsersSpy.mock.calls.length;
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS * 3));
    expect(getUsersSpy.mock.calls.length).toBe(callsAfterUnmount);
  });
});
