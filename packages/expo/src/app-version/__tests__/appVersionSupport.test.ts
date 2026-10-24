import { act, render } from '@testing-library/react';
import { createElement, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { NativeAppIdentity } from '../nativeAppIdentity';

const mocks = vi.hoisted(() => ({
  identity: null as NativeAppIdentity | null,
  expoApplicationInstalled: true,
}));

vi.mock('../nativeAppIdentity', () => ({
  getNativeAppIdentity: () => mocks.identity,
  getNativeAppPlatform: () => 'ios',
  isExpoApplicationInstalled: () => mocks.expoApplicationInstalled,
}));

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.example.app';
const APP_STORE_URL = 'https://apps.apple.com/app/id123';

const environment = ({
  ios = [] as unknown[],
  android = [] as unknown[],
}: {
  ios?: unknown[];
  android?: unknown[];
} = {}) => ({ native_app_settings: { minimum_supported_version: { ios, android } } });

const iosPolicy = (minimumVersion: unknown, updateUrl: unknown = APP_STORE_URL) => ({
  bundle_id: 'com.example.app',
  minimum_version: minimumVersion,
  update_url: updateUrl,
});

const loadStore = async () => import('../appVersionSupport');

describe('appVersionSupport', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.identity = { platform: 'ios', appIdentifier: 'com.example.app', version: '1.9.9', displayVersion: '1.9.9' };
    mocks.expoApplicationInstalled = true;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const fetchEnvironment = (store: Awaited<ReturnType<typeof loadStore>>, json: unknown) => {
    store.applyFetchedEnvironment(json, store.getAppVersionSupportGeneration());
  };

  test('reports a supported app before anything is known', async () => {
    const store = await loadStore();

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: true,
      currentVersion: '1.9.9',
      minimumVersion: null,
      updateUrl: null,
    });
  });

  test('blocks an iOS app older than its minimum', async () => {
    const store = await loadStore();

    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: false,
      currentVersion: '1.9.9',
      minimumVersion: '2.0',
      updateUrl: APP_STORE_URL,
    });
  });

  test.each([
    ['at its minimum', '1.10.0'],
    ['at its minimum written with fewer components', '1.10'],
    ['above its minimum', '1.9.9'],
  ])('lets an iOS app %s through', async (_label, minimumVersion) => {
    mocks.identity = { platform: 'ios', appIdentifier: 'com.example.app', version: '1.10.0', displayVersion: '1.10.0' };
    const store = await loadStore();

    fetchEnvironment(store, environment({ ios: [iosPolicy(minimumVersion)] }));

    expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
  });

  test('compares Android version codes', async () => {
    mocks.identity = { platform: 'android', appIdentifier: 'com.example.app', version: '41', displayVersion: '41' };
    const store = await loadStore();

    fetchEnvironment(
      store,
      environment({ android: [{ package_name: 'com.example.app', minimum_version: '42', update_url: PLAY_URL }] }),
    );

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: false,
      currentVersion: '41',
      minimumVersion: '42',
      updateUrl: PLAY_URL,
    });
  });

  test.each([['4.2.1.0'], ['abc'], [''], [42]])(
    'lets the app through when the minimum %j is unreadable',
    async minimum => {
      const store = await loadStore();

      fetchEnvironment(store, environment({ ios: [iosPolicy(minimum)] }));

      expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
    },
  );

  test('ignores minimums for other apps and malformed settings', async () => {
    const store = await loadStore();

    fetchEnvironment(
      store,
      environment({ ios: ['not a policy', { bundle_id: 'com.example.other', minimum_version: '9.0' }] }),
    );
    expect(store.getAppVersionSupportStatus().isSupported).toBe(true);

    fetchEnvironment(store, { native_app_settings: 'not settings' });
    expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
  });

  test.each([['market://details?id=com.example.app'], ['javascript:alert(1)'], ['not a url']])(
    'drops the update URL %s',
    async updateUrl => {
      const store = await loadStore();

      fetchEnvironment(store, environment({ ios: [iosPolicy('2.0', updateUrl)] }));

      expect(store.getAppVersionSupportStatus().updateUrl).toBeNull();
    },
  );

  test('a rejection blocks the app until a later response marks it supported', async () => {
    const store = await loadStore();
    const generation = store.getAppVersionSupportGeneration();

    store.applyUnsupportedAppVersion({ minimum_version: '2.0', update_url: APP_STORE_URL }, generation);
    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: false,
      currentVersion: '1.9.9',
      minimumVersion: '2.0',
      updateUrl: APP_STORE_URL,
    });

    store.applySupportedAppVersion(generation);
    expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
  });

  test('a rejection falls back to the environment for what its meta leaves out', async () => {
    const store = await loadStore();
    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    store.applyUnsupportedAppVersion({ update_url: '' }, store.getAppVersionSupportGeneration());

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: false,
      currentVersion: '1.9.9',
      minimumVersion: '2.0',
      updateUrl: APP_STORE_URL,
    });
  });

  test('an environment does not lift a rejection', async () => {
    const store = await loadStore();
    store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, store.getAppVersionSupportGeneration());

    fetchEnvironment(store, environment());

    expect(store.getAppVersionSupportStatus()).toMatchObject({ isSupported: false, minimumVersion: '2.0' });
  });

  test('an environment does not block an app a response marked supported', async () => {
    const store = await loadStore();
    store.applySupportedAppVersion(store.getAppVersionSupportGeneration());

    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: true,
      currentVersion: '1.9.9',
      minimumVersion: null,
      updateUrl: null,
    });
  });

  test('a supported answer shows the minimum a later environment sets', async () => {
    mocks.identity = { platform: 'ios', appIdentifier: 'com.example.app', version: '2.1', displayVersion: '2.1' };
    const store = await loadStore();
    store.applySupportedAppVersion(store.getAppVersionSupportGeneration());

    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    expect(store.getAppVersionSupportStatus()).toMatchObject({ isSupported: true, minimumVersion: '2.0' });
  });

  test('a supported answer keeps the minimum and store page the environment set', async () => {
    mocks.identity = { platform: 'ios', appIdentifier: 'com.example.app', version: '2.1', displayVersion: '2.1' };
    const store = await loadStore();
    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    store.applySupportedAppVersion(store.getAppVersionSupportGeneration());

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: true,
      currentVersion: '2.1',
      minimumVersion: '2.0',
      updateUrl: APP_STORE_URL,
    });
  });

  test('a supported answer drops a minimum the server no longer enforces', async () => {
    const store = await loadStore();
    fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

    store.applySupportedAppVersion(store.getAppVersionSupportGeneration());

    expect(store.getAppVersionSupportStatus()).toEqual({
      isSupported: true,
      currentVersion: '1.9.9',
      minimumVersion: null,
      updateUrl: null,
    });
  });

  test('ignores answers for a Clerk instance that was replaced', async () => {
    const store = await loadStore();
    const staleGeneration = store.getAppVersionSupportGeneration();
    store.resetAppVersionSupport();

    store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, staleGeneration);

    expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
  });

  test('a reset during render updates subscribers after the render, not during it', async () => {
    const store = await loadStore();
    const { useAppVersionSupport } = await import('../../hooks/useAppVersionSupport');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const seen: (string | null)[] = [];
    const Subscriber = () => {
      seen.push(useAppVersionSupport().minimumVersion);
      return null;
    };
    const Provider = ({ instance }: { instance: number }) => {
      const resetFor = useRef(0);
      if (resetFor.current !== instance) {
        resetFor.current = instance;
        store.resetAppVersionSupport();
      }
      return createElement(Subscriber);
    };
    const view = render(createElement(Provider, { instance: 0 }));
    act(() => fetchEnvironment(store, environment({ ios: [iosPolicy('1.0')] })));

    await act(async () => {
      view.rerender(createElement(Provider, { instance: 1 }));
      await Promise.resolve();
    });

    expect(consoleError.mock.calls.some(([message]) => String(message).includes('Cannot update a component'))).toBe(
      false,
    );
    expect(store.getAppVersionSupportStatus().minimumVersion).toBeNull();
    expect(seen.at(-1)).toBeNull();
  });

  test('notifies subscribers only when the status changes', async () => {
    const store = await loadStore();
    const listener = vi.fn();
    store.subscribeToAppVersionSupport(listener);
    const generation = store.getAppVersionSupportGeneration();

    store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, generation);
    store.applyUnsupportedAppVersion({ minimum_version: '2.0' }, generation);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe('without expo-application', () => {
    beforeEach(() => {
      mocks.identity = null;
      mocks.expoApplicationInstalled = false;
      vi.stubGlobal('__DEV__', true);
    });

    test('warns once in development when the instance sets minimums', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = await loadStore();

      fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));
      fetchEnvironment(store, environment({ ios: [iosPolicy('2.0')] }));

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('npx expo install expo-application');
      expect(store.getAppVersionSupportStatus().isSupported).toBe(true);
    });

    test('stays quiet when the instance sets no minimums', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const store = await loadStore();

      fetchEnvironment(store, environment());

      expect(warn).not.toHaveBeenCalled();
    });
  });
});
