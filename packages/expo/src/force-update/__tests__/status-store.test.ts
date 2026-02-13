import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    platformOS: 'ios',
    getNativeAppInfo: vi.fn(),
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return mocks.platformOS;
      },
    },
  };
});

vi.mock('../nativeAppInfo', () => {
  return {
    getNativeAppInfo: mocks.getNativeAppInfo,
  };
});

import {
  __internal_resetForceUpdateStatus,
  applyForceUpdateStatusFromErrorMeta,
  attachNativeAppHeaders,
  getForceUpdateStatus,
  refreshForceUpdateStatus,
  resolveForceUpdateStatus,
} from '../status-store';

describe('force-update status store', () => {
  beforeEach(() => {
    __internal_resetForceUpdateStatus();
    mocks.getNativeAppInfo.mockReset();
    mocks.platformOS = 'ios';
  });

  test('returns unsupported when current iOS version is below minimum', async () => {
    mocks.getNativeAppInfo.mockResolvedValue({
      currentVersion: '1.2.0',
      bundleId: 'com.example.app',
      packageName: null,
    });

    const status = await refreshForceUpdateStatus({
      forceUpdate: {
        ios: [
          {
            bundleId: 'com.example.app',
            minimumVersion: '1.3.0',
            updateUrl: 'https://apps.apple.com/id123',
          },
        ],
        android: [],
      },
    });

    expect(status.isSupported).toBe(false);
    expect(status.reason).toBe('below_minimum');
    expect(status.minimumVersion).toBe('1.3.0');
    expect(getForceUpdateStatus().isSupported).toBe(false);
  });

  test('fails open when current app version is invalid', async () => {
    mocks.getNativeAppInfo.mockResolvedValue({
      currentVersion: '1.2-beta',
      bundleId: 'com.example.app',
      packageName: null,
    });

    const status = await refreshForceUpdateStatus({
      forceUpdate: {
        ios: [{ bundleId: 'com.example.app', minimumVersion: '1.3.0', updateUrl: null }],
        android: [],
      },
    });

    expect(status.isSupported).toBe(true);
    expect(status.reason).toBe('invalid_current_version');
  });

  test('supports snake_case force_update payloads', () => {
    const status = resolveForceUpdateStatus(
      {
        force_update: {
          ios: [{ bundle_id: 'com.example.app', minimum_version: '2.0.0', update_url: 'https://apps.apple.com/id123' }],
        },
      },
      {
        currentVersion: '1.0.0',
        bundleId: 'com.example.app',
        packageName: null,
      },
    );

    expect(status.isSupported).toBe(false);
    expect(status.reason).toBe('below_minimum');
  });

  test('supports partial camelCase forceUpdate payloads', () => {
    mocks.platformOS = 'android';

    const status = resolveForceUpdateStatus(
      {
        forceUpdate: {
          android: [
            {
              packageName: 'com.example.android',
              minimumVersion: '2.0.0',
              updateUrl: 'https://play.google.com/store/apps/details?id=com.example.android',
            },
          ],
        },
      },
      {
        currentVersion: '1.0.0',
        bundleId: null,
        packageName: 'com.example.android',
      },
    );

    expect(status.isSupported).toBe(false);
    expect(status.reason).toBe('below_minimum');
  });

  test('injects iOS headers when app metadata is available', async () => {
    mocks.getNativeAppInfo.mockResolvedValue({
      currentVersion: '1.0.0',
      bundleId: 'com.example.app',
      packageName: null,
    });

    const headers = new Headers();
    await attachNativeAppHeaders(headers);

    expect(headers.get('x-app-version')).toBe('1.0.0');
    expect(headers.get('x-bundle-id')).toBe('com.example.app');
    expect(headers.get('x-package-name')).toBeNull();
  });

  test('injects Android headers when app metadata is available', async () => {
    mocks.platformOS = 'android';
    mocks.getNativeAppInfo.mockResolvedValue({
      currentVersion: '1.0.0',
      bundleId: null,
      packageName: 'com.example.android',
    });

    const headers = new Headers();
    await attachNativeAppHeaders(headers);

    expect(headers.get('x-app-version')).toBe('1.0.0');
    expect(headers.get('x-bundle-id')).toBeNull();
    expect(headers.get('x-package-name')).toBe('com.example.android');
  });

  test('applies unsupported-app-version error meta immediately', async () => {
    mocks.getNativeAppInfo.mockResolvedValue({
      currentVersion: '1.0.0',
      bundleId: 'com.example.app',
      packageName: null,
    });

    const status = await applyForceUpdateStatusFromErrorMeta({
      platform: 'ios',
      app_identifier: 'com.example.app',
      current_version: '1.0.0',
      minimum_version: '2.0.0',
      update_url: 'https://apps.apple.com/id123',
    });

    expect(status?.isSupported).toBe(false);
    expect(status?.reason).toBe('server_rejected');
    expect(status?.minimumVersion).toBe('2.0.0');
  });
});
