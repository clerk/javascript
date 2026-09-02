import { act, render, renderHook, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DirectorySyncResource } from '@/types/directorySync';

import type { UseOrganizationDirectorySyncUsersReturn } from '../useOrganizationDirectorySyncUsers';
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

const renderUsers = (initialDirectory: DirectorySyncResource | null) =>
  renderHook(
    ({ directory }: { directory: DirectorySyncResource | null }) =>
      __internal_useOrganizationDirectorySyncUsers({ directory, pollIntervalMs: POLL_INTERVAL_MS }),
    { wrapper, initialProps: { directory: initialDirectory } },
  );

describe('useOrganizationDirectorySyncUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('stays dormant without a directory', () => {
    const { result } = renderUsers(null);

    expect(getUsersSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls while armed and stops on stopPolling', async () => {
    const { result } = renderUsers(createDirectory('dir_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPolling).toBe(false);

    act(() => result.current.startPolling());
    expect(result.current.isPolling).toBe(true);
    await waitFor(() => expect(getUsersSpy.mock.calls.length).toBeGreaterThanOrEqual(3));

    act(() => result.current.stopPolling());
    expect(result.current.isPolling).toBe(false);
  });

  it('disarms polling when the directory identity changes', async () => {
    const { result, rerender } = renderUsers(createDirectory('dir_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.startPolling());
    expect(result.current.isPolling).toBe(true);

    rerender({ directory: createDirectory('dir_2') });
    expect(result.current.isPolling).toBe(false);
  });

  it('keeps polling armed by a child effect in the same commit the directory arrives', async () => {
    let latest: UseOrganizationDirectorySyncUsersReturn | undefined;

    // Child effects run before parent effects, so this is the ordering a
    // reset-in-effect implementation would silently cancel.
    const Child = ({
      directory,
      startPolling,
    }: {
      directory: DirectorySyncResource | null;
      startPolling: () => void;
    }) => {
      useEffect(() => {
        if (directory) {
          startPolling();
        }
      }, [directory, startPolling]);
      return null;
    };

    const Parent = ({ directory }: { directory: DirectorySyncResource | null }) => {
      latest = __internal_useOrganizationDirectorySyncUsers({ directory, pollIntervalMs: POLL_INTERVAL_MS });
      return (
        <Child
          directory={directory}
          startPolling={latest.startPolling}
        />
      );
    };

    const { rerender } = render(<Parent directory={null} />);
    expect(latest?.isPolling).toBe(false);

    rerender(<Parent directory={createDirectory('dir_1')} />);

    await waitFor(() => expect(latest?.isPolling).toBe(true));
    await waitFor(() => expect(getUsersSpy.mock.calls.length).toBeGreaterThanOrEqual(3));
  });
});
