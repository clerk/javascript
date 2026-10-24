import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../app-version/nativeAppIdentity', () => ({
  getNativeAppIdentity: () => ({
    platform: 'ios',
    appIdentifier: 'com.example.app',
    version: '1.0',
    displayVersion: '1.0',
  }),
  getNativeAppPlatform: () => 'ios',
  isExpoApplicationInstalled: () => true,
}));

describe('useAppVersionSupport', () => {
  test('re-renders when the app becomes unsupported and supported again', async () => {
    const store = await import('../../app-version/appVersionSupport');
    const { useAppVersionSupport } = await import('../useAppVersionSupport');
    const { result } = renderHook(() => useAppVersionSupport());
    expect(result.current.isSupported).toBe(true);

    act(() => {
      store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, store.getAppVersionSupportGeneration());
    });
    expect(result.current).toMatchObject({ isSupported: false, currentVersion: '1.0', minimumVersion: '2.0' });

    act(() => {
      store.applySupportedAppVersion(store.getAppVersionSupportGeneration());
    });
    expect(result.current.isSupported).toBe(true);
  });
});
