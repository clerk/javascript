import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../nativeAppIdentity', () => ({
  getNativeAppIdentity: () => ({
    platform: 'ios',
    appIdentifier: 'com.example.app',
    version: '1.0',
    displayVersion: '1.0',
  }),
  getNativeAppPlatform: () => 'ios',
  isExpoApplicationInstalled: () => true,
}));

const loadModules = async () => {
  const store = await import('../appVersionSupport');
  const { useClerkRestartWhenSupported } = await import('../useClerkRestartWhenSupported');
  return { store, useClerkRestartWhenSupported };
};

describe('useClerkRestartWhenSupported', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const block = (store: Awaited<ReturnType<typeof loadModules>>['store']) =>
    act(() => {
      store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, store.nextAppVersionRequest());
    });

  const unblock = (store: Awaited<ReturnType<typeof loadModules>>['store']) =>
    act(() => {
      store.applySupportedAppVersion(store.nextAppVersionRequest());
    });

  test('restarts Clerk when the app becomes supported after Clerk failed to load', async () => {
    const { store, useClerkRestartWhenSupported } = await loadModules();
    const discard = vi.fn();
    const { result } = renderHook(() => useClerkRestartWhenSupported({ status: 'error' }, discard));

    block(store);
    expect(result.current).toBe(0);
    unblock(store);

    expect(discard).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(1);
  });

  test('leaves a loaded Clerk alone when the block lifts', async () => {
    const { store, useClerkRestartWhenSupported } = await loadModules();
    const discard = vi.fn();
    const { result } = renderHook(() => useClerkRestartWhenSupported({ status: 'ready' }, discard));

    block(store);
    unblock(store);

    expect(discard).not.toHaveBeenCalled();
    expect(result.current).toBe(0);
  });

  test('leaves a failed Clerk alone when the app was never blocked', async () => {
    const discard = vi.fn();
    const { useClerkRestartWhenSupported } = await loadModules();
    renderHook(() => useClerkRestartWhenSupported({ status: 'error' }, discard));

    expect(discard).not.toHaveBeenCalled();
  });
});
