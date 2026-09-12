import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { NativeClientEvent } from '../../hooks/useNativeClientEvents';
import {
  __internal_resetNativeClientSyncCoordinator,
  registerNativeToJsSyncHandler,
  synchronizeNativeClientToJs,
  trackPendingJsToNativeSync,
  waitForPendingJsToNativeSync,
} from '../nativeClientSyncCoordinator';

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(innerResolve => {
    resolve = innerResolve;
  });
  return { promise, resolve };
}

function rejectableDeferred(): { promise: Promise<void>; reject: (error: Error) => void } {
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((_resolve, innerReject) => {
    reject = innerReject;
  });
  return { promise, reject };
}

function nativeClientEvent(issuedAt: number): NativeClientEvent {
  return {
    issuedAt,
    changed: { client: true, deviceToken: true },
    deviceToken: `native-token-${issuedAt}`,
  };
}

let unregister: (() => void) | undefined;

beforeEach(() => {
  __internal_resetNativeClientSyncCoordinator();
});

afterEach(() => {
  vi.useRealTimers();
  unregister?.();
  unregister = undefined;
});

describe('native client sync coordinator', () => {
  test('preserves a JS-to-native sync failure until a later sync succeeds', async () => {
    const error = new Error('native sync failed');
    trackPendingJsToNativeSync(Promise.reject(error));

    await expect(waitForPendingJsToNativeSync()).rejects.toBe(error);
    await expect(waitForPendingJsToNativeSync()).rejects.toBe(error);

    trackPendingJsToNativeSync(Promise.resolve());
    await expect(waitForPendingJsToNativeSync()).resolves.toBeUndefined();
  });

  test('does not restore an older failure after a newer sync succeeds', async () => {
    const olderSync = rejectableDeferred();
    trackPendingJsToNativeSync(olderSync.promise);
    trackPendingJsToNativeSync(Promise.resolve());

    olderSync.reject(new Error('stale native sync failure'));

    await expect(waitForPendingJsToNativeSync()).resolves.toBeUndefined();
  });

  test('ignores a tracked synchronization that is invalidated before it rejects', async () => {
    const staleSync = rejectableDeferred();
    const invalidate = trackPendingJsToNativeSync(staleSync.promise);

    invalidate();
    staleSync.reject(new Error('canceled native refresh failed'));
    await Promise.resolve();

    await expect(waitForPendingJsToNativeSync()).resolves.toBeUndefined();
  });

  test('rejects with environment unavailable when JS-to-native synchronization times out', async () => {
    vi.useFakeTimers();
    const pendingSync = deferred();
    trackPendingJsToNativeSync(pendingSync.promise);

    const waiting = expect(waitForPendingJsToNativeSync()).rejects.toMatchObject({
      code: 'environment_unavailable',
      message: 'Timed out waiting for the native Clerk client to synchronize.',
    });

    await vi.advanceTimersByTimeAsync(5_000);
    await waiting;
    pendingSync.resolve();
  });

  test('honors an extended timeout for native bootstrap synchronization', async () => {
    vi.useFakeTimers();
    const pendingSync = deferred();
    trackPendingJsToNativeSync(pendingSync.promise, 15_000);

    const waiting = waitForPendingJsToNativeSync();
    let didSettle = false;
    void waiting.then(
      () => {
        didSettle = true;
      },
      () => {
        didSettle = true;
      },
    );

    await vi.advanceTimersByTimeAsync(5_000);
    expect(didSettle).toBe(false);

    pendingSync.resolve();
    await expect(waiting).resolves.toBeUndefined();
  });

  test('ignores pending synchronization outcomes from before a reset', async () => {
    const staleSync = rejectableDeferred();
    trackPendingJsToNativeSync(staleSync.promise);

    __internal_resetNativeClientSyncCoordinator();
    trackPendingJsToNativeSync(Promise.resolve());
    staleSync.reject(new Error('stale native sync failure'));

    await expect(waitForPendingJsToNativeSync()).resolves.toBeUndefined();
  });

  test('waits for an event sync before starting explicit synchronization', async () => {
    const eventSync = deferred();
    const explicitSync = deferred();
    const handler = vi.fn((event?: NativeClientEvent | null) => (event ? eventSync.promise : explicitSync.promise));
    unregister = registerNativeToJsSyncHandler(handler);

    const fromEvent = synchronizeNativeClientToJs(nativeClientEvent(1));
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    const explicit = synchronizeNativeClientToJs();
    await Promise.resolve();
    expect(handler).toHaveBeenCalledTimes(1);

    eventSync.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
    expect(handler).toHaveBeenLastCalledWith();

    explicitSync.resolve();
    await Promise.all([fromEvent, explicit]);
  });

  test('runs a follow-up synchronization when an event arrives during explicit synchronization', async () => {
    const explicitSync = deferred();
    const followUpSync = deferred();
    const signOutEvent: NativeClientEvent = {
      issuedAt: 1,
      changed: { client: true, deviceToken: true },
      deviceToken: null,
    };
    const handler = vi
      .fn()
      .mockImplementationOnce(() => explicitSync.promise)
      .mockImplementationOnce(() => followUpSync.promise);
    unregister = registerNativeToJsSyncHandler(handler);

    const explicit = synchronizeNativeClientToJs();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    const fromEvent = synchronizeNativeClientToJs(signOutEvent);
    expect(fromEvent).toBe(explicit);

    explicitSync.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
    expect(handler).toHaveBeenLastCalledWith(signOutEvent);

    let didFinish = false;
    void fromEvent.then(() => {
      didFinish = true;
    });
    await Promise.resolve();
    expect(didFinish).toBe(false);

    followUpSync.resolve();
    await Promise.all([explicit, fromEvent]);
  });

  test('merges change flags while preserving the latest event snapshot during explicit synchronization', async () => {
    const explicitSync = deferred();
    const followUpSync = deferred();
    const handler = vi
      .fn()
      .mockImplementationOnce(() => explicitSync.promise)
      .mockImplementationOnce(() => followUpSync.promise);
    unregister = registerNativeToJsSyncHandler(handler);

    const explicit = synchronizeNativeClientToJs();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    const clientEvent: NativeClientEvent = {
      issuedAt: 1,
      changed: { client: true, deviceToken: false },
      deviceToken: 'native-token-1',
    };
    const tokenEvent: NativeClientEvent = {
      issuedAt: 2,
      changed: { client: false, deviceToken: true },
      deviceToken: null,
      sourceId: 'native-sign-out',
    };
    const fromClientEvent = synchronizeNativeClientToJs(clientEvent);
    const fromTokenEvent = synchronizeNativeClientToJs(tokenEvent);

    explicitSync.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
    expect(handler).toHaveBeenLastCalledWith({
      ...tokenEvent,
      changed: { client: true, deviceToken: true },
    });

    followUpSync.resolve();
    await Promise.all([explicit, fromClientEvent, fromTokenEvent]);
  });

  test('runs a follow-up synchronization for another explicit request', async () => {
    const firstSync = deferred();
    const followUpSync = deferred();
    const handler = vi
      .fn()
      .mockImplementationOnce(() => firstSync.promise)
      .mockImplementationOnce(() => followUpSync.promise);
    unregister = registerNativeToJsSyncHandler(handler);

    const first = synchronizeNativeClientToJs();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

    const second = synchronizeNativeClientToJs();
    expect(second).toBe(first);

    firstSync.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));

    followUpSync.resolve();
    await Promise.all([first, second]);
  });

  test('serializes native event synchronizations in arrival order', async () => {
    const firstSync = deferred();
    const secondSync = deferred();
    const handler = vi.fn((event?: NativeClientEvent | null) =>
      event?.issuedAt === 1 ? firstSync.promise : secondSync.promise,
    );
    unregister = registerNativeToJsSyncHandler(handler);

    const first = synchronizeNativeClientToJs(nativeClientEvent(1));
    const second = synchronizeNativeClientToJs(nativeClientEvent(2));

    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    expect(handler).toHaveBeenLastCalledWith(nativeClientEvent(1));

    firstSync.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
    expect(handler).toHaveBeenLastCalledWith(nativeClientEvent(2));

    secondSync.resolve();
    await Promise.all([first, second]);
  });
});
