import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __internal_useOrganizationSsoBypassAllowlist } from '../useOrganizationSsoBypassAllowlist';
import { createMockClerk, createMockQueryClient } from './mocks/clerk';
import { wrapper } from './wrapper';

const entry = (userId: string) => ({ id: userId, userId, publicUserData: { identifier: `${userId}@clerk.com` } });

const getSpy = vi.fn(() => Promise.resolve([entry('user_1')]));
const addSpy = vi.fn(() => Promise.resolve(entry('user_2')));
const removeSpy = vi.fn(() => Promise.resolve({ id: 'user_1', deleted: true }));

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  queryClient: defaultQueryClient,
  __internal_lastEmittedResources: {
    user: null,
    session: null,
    organization: {
      id: 'org_1',
      getSsoBypassAllowlistUsers: getSpy,
      addSsoBypassAllowlistUser: addSpy,
      removeSsoBypassAllowlistUser: removeSpy,
    },
    client: null,
  },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
  useInitialStateContext: () => undefined,
}));

const renderAllowlist = (params?: Parameters<typeof __internal_useOrganizationSsoBypassAllowlist>[0]) =>
  renderHook(() => __internal_useOrganizationSsoBypassAllowlist(params), { wrapper });

describe('useOrganizationSsoBypassAllowlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
  });

  it('lists the allowlist of the active organization', async () => {
    const { result } = renderAllowlist();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([entry('user_1')]);
    expect(result.current.error).toBeNull();
  });

  it('stays dormant when disabled', () => {
    const { result } = renderAllowlist({ enabled: false });

    expect(getSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('adds a user and refetches the list before resolving', async () => {
    const { result } = renderAllowlist();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const added = await result.current.addUser({ userId: 'user_2' });

    expect(addSpy).toHaveBeenCalledWith({ userId: 'user_2' });
    expect(added).toEqual(entry('user_2'));
    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
  });

  it('removes a user and refetches the list before resolving', async () => {
    const { result } = renderAllowlist();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const removed = await result.current.removeUser('user_1');

    expect(removeSpy).toHaveBeenCalledWith('user_1');
    expect(removed).toEqual({ id: 'user_1', deleted: true });
    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
  });
});
