import { QueryObserver } from '@tanstack/query-core';
import { describe, expect, it, vi } from 'vitest';

import { createLoomClient } from '../client';
import type { UserSnapshot } from '../types';

const scope = { instanceKey: 'test', userId: 'user_a', sessionId: 'session_a' };
const user: UserSnapshot = {
  id: 'user_a',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: null,
  imageUrl: '',
  hasImage: false,
  primaryEmailAddressId: null,
  emailAddresses: [],
  enterpriseAccounts: [],
  passwordEnabled: false,
  deleteSelfEnabled: true,
  externalAccounts: [],
};

describe('user name mutation', () => {
  it('commits the returned snapshot to two observers and fences an older read', async () => {
    const oldRead = Promise.withResolvers<UserSnapshot>();
    const update = Promise.withResolvers<UserSnapshot>();
    const readUser = vi.fn(() => oldRead.promise);
    const updateName = vi.fn(() => update.promise);
    const loom = createLoomClient({
      scope,
      readUser,
      updateName,
      hydration: { version: 5, scope, user: { data: user, updatedAt: Date.now() } },
    });
    const first = vi.fn();
    const second = vi.fn();
    const firstObserver = new QueryObserver(loom.queryClient, loom.userQueryOptions());
    const secondObserver = new QueryObserver(loom.queryClient, loom.userQueryOptions());
    const stopFirst = firstObserver.subscribe(first);
    const stopSecond = secondObserver.subscribe(second);
    const reading = loom.refreshUser();
    const rejected = expect(reading).rejects.toThrow();
    await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(1));
    const changed = { ...user, firstName: 'Augusta' };
    const mutation = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    await vi.waitFor(() => expect(updateName).toHaveBeenCalledTimes(1));
    update.resolve(changed);
    expect(await mutation).toEqual(changed);
    oldRead.resolve(user);
    await rejected;
    expect(loom.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toEqual(changed);
    expect(first.mock.lastCall?.[0].data).toEqual(changed);
    expect(second.mock.lastCall?.[0].data).toEqual(changed);
    stopFirst();
    stopSecond();
    loom.dispose();
  });

  it('defers listener invalidation and rejects a read begun during the edit', async () => {
    const during = Promise.withResolvers<UserSnapshot>();
    const update = Promise.withResolvers<UserSnapshot>();
    const readUser = vi.fn(() => during.promise);
    const loom = createLoomClient({
      scope,
      readUser,
      updateName: () => update.promise,
      hydration: { version: 5, scope, user: { data: user, updatedAt: Date.now() } },
    });
    const mutation = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    await loom.invalidateUser();
    expect(readUser).not.toHaveBeenCalled();
    const reading = loom.refreshUser();
    const rejected = expect(reading).rejects.toThrow();
    await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(1));
    const changed = { ...user, firstName: 'Augusta' };
    update.resolve(changed);
    expect(await mutation).toEqual(changed);
    during.resolve(user);
    await rejected;
    expect(loom.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toEqual(changed);
    expect(readUser).toHaveBeenCalledTimes(1);
    loom.dispose();
  });

  it('rejects overlapping edits and preserves a failed edit for retry', async () => {
    const pending = Promise.withResolvers<UserSnapshot>();
    const failure = new Error('invalid first name');
    const updateName = vi
      .fn()
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValue({ ...user, firstName: 'Grace' });
    const loom = createLoomClient({
      scope,
      updateName,
      hydration: { version: 5, scope, user: { data: user, updatedAt: Date.now() } },
    });
    const first = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    await expect(loom.updateName({ firstName: 'Grace', lastName: 'Hopper' })).rejects.toThrow();
    expect(updateName).toHaveBeenCalledTimes(1);
    pending.reject(failure);
    await expect(first).rejects.toBe(failure);
    expect(loom.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toEqual(user);
    expect(await loom.updateName({ firstName: 'Grace', lastName: 'Hopper' })).toMatchObject({ firstName: 'Grace' });
    loom.dispose();
  });

  it('reconciles a deferred listener after a failed edit while preserving the original error', async () => {
    const pendingWrite = Promise.withResolvers<UserSnapshot>();
    const pendingRead = Promise.withResolvers<UserSnapshot>();
    const failure = new Error('Clerk rejected the name');
    const readUser = vi.fn(() => pendingRead.promise);
    const updateName = vi.fn(() => pendingWrite.promise);
    const loom = createLoomClient({
      scope,
      readUser,
      updateName,
      hydration: { version: 5, scope, user: { data: user, updatedAt: Date.now() } },
    });
    const observer = new QueryObserver(loom.queryClient, loom.userQueryOptions());
    const stop = observer.subscribe(() => {});
    const mutation = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    const rejected = expect(mutation).rejects.toBe(failure);
    await vi.waitFor(() => expect(updateName).toHaveBeenCalledTimes(1));
    await loom.invalidateUser();
    expect(readUser).not.toHaveBeenCalled();
    pendingWrite.reject(failure);
    await rejected;
    await vi.waitFor(() => expect(readUser).toHaveBeenCalledTimes(1));
    expect(loom.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toEqual(user);
    pendingRead.resolve({ ...user, firstName: 'Grace' });
    await vi.waitFor(() =>
      expect(loom.queryClient.getQueryData<UserSnapshot>(loom.userQueryOptions().queryKey)?.firstName).toBe('Grace'),
    );
    stop();
    loom.dispose();
  });

  it('rejects a completed edit after disposal without restoring the retired cache', async () => {
    const pending = Promise.withResolvers<UserSnapshot>();
    const updateName = vi.fn(() => pending.promise);
    const loom = createLoomClient({ scope, updateName });
    const result = loom.updateName({ firstName: 'Augusta', lastName: 'Lovelace' });
    const rejected = expect(result).rejects.toThrow('disposed');
    await vi.waitFor(() => expect(updateName).toHaveBeenCalledTimes(1));
    loom.dispose();
    pending.resolve({ ...user, firstName: 'Augusta' });
    await rejected;
    expect(loom.queryClient.getQueryData(loom.userQueryOptions().queryKey)).toBeUndefined();
  });
});
