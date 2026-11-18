import Module from 'node:module';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { resolveBrowserLauncher } from '../launchBrowser.android';

const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent?: unknown, isMain?: boolean) => unknown;
};
const originalModuleLoad = moduleWithLoad._load;

const mocks = vi.hoisted(() => {
  return {
    appStateListeners: [] as Array<(state: string) => void>,
    removeSubscription: vi.fn(),
    startActivityAsync: vi.fn(),
    applicationId: 'com.example.app' as string | null,
    expoApplicationInstalled: true,
    androidPackage: undefined as string | undefined,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: { OS: 'android' },
    AppState: {
      addEventListener: (_: string, listener: (state: string) => void) => {
        mocks.appStateListeners.push(listener);
        return { remove: mocks.removeSubscription };
      },
    },
  };
});

const TRANSFER_URL = 'https://clerk.example.com/v1/session_transfers/redeem?token=one-time';

function pending() {
  let resolve: (value: unknown) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function changeAppState(state: string) {
  mocks.appStateListeners.forEach(listener => listener(state));
}

async function outcome(promise: Promise<void>) {
  const settled = await Promise.race([
    promise.then(
      () => 'resolved',
      (error: unknown) => error,
    ),
    new Promise(resolve => setTimeout(() => resolve('pending'), 0)),
  ]);
  return settled;
}

describe('resolveBrowserLauncher on Android', () => {
  beforeEach(() => {
    mocks.appStateListeners = [];
    mocks.removeSubscription.mockReset();
    mocks.startActivityAsync.mockReset();
    mocks.applicationId = 'com.example.app';
    mocks.expoApplicationInstalled = true;
    mocks.androidPackage = undefined;
    vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'expo-intent-launcher') {
        return { startActivityAsync: mocks.startActivityAsync };
      }
      if (request === 'expo-application') {
        if (!mocks.expoApplicationInstalled) {
          throw new Error("Cannot find module 'expo-application'");
        }
        return { applicationId: mocks.applicationId };
      }
      if (request === 'expo-constants') {
        return {
          default: { executionEnvironment: 'standalone', expoConfig: { android: { package: mocks.androidPackage } } },
        };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('sends REFERRER_NAME with the application id and leaves the browser choice to Android', async () => {
    mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });

    await resolveBrowserLauncher()(TRANSFER_URL);

    expect(mocks.startActivityAsync).toHaveBeenCalledWith('android.intent.action.VIEW', {
      data: TRANSFER_URL,
      extra: { 'android.intent.extra.REFERRER_NAME': 'android-app://com.example.app' },
    });
    expect(mocks.startActivityAsync.mock.calls[0][1]).not.toHaveProperty('packageName');
  });

  test('falls back to the package name from the app config without expo-application', async () => {
    mocks.expoApplicationInstalled = false;
    mocks.androidPackage = 'com.example.config';
    mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });

    await resolveBrowserLauncher()(TRANSFER_URL);

    expect(mocks.startActivityAsync).toHaveBeenCalledWith(
      'android.intent.action.VIEW',
      expect.objectContaining({ extra: { 'android.intent.extra.REFERRER_NAME': 'android-app://com.example.config' } }),
    );
  });

  test('throws missing_dependency when no package name is available', () => {
    mocks.expoApplicationInstalled = false;

    expect(() => resolveBrowserLauncher()).toThrow(
      expect.objectContaining({ code: 'missing_dependency', message: expect.stringContaining('expo-application') }),
    );
  });

  test('resolves when the launch settles', async () => {
    mocks.startActivityAsync.mockResolvedValue({ resultCode: 0 });

    await expect(outcome(resolveBrowserLauncher()(TRANSFER_URL))).resolves.toBe('resolved');
    expect(mocks.removeSubscription).toHaveBeenCalled();
  });

  test('resolves when the app leaves the foreground before the launch settles', async () => {
    const launch = pending();
    mocks.startActivityAsync.mockReturnValue(launch.promise);
    const opening = resolveBrowserLauncher()(TRANSFER_URL);

    changeAppState('active');
    await expect(outcome(opening)).resolves.toBe('pending');
    changeAppState('background');

    await expect(outcome(opening)).resolves.toBe('resolved');
    expect(mocks.removeSubscription).toHaveBeenCalled();
    launch.reject(new Error('activity finished'));
    await expect(outcome(opening)).resolves.toBe('resolved');
  });

  test('rejects with browser_unavailable when the launch fails first', async () => {
    mocks.startActivityAsync.mockRejectedValue(new Error(`No Activity found to handle Intent { dat=${TRANSFER_URL} }`));

    const result = await outcome(resolveBrowserLauncher()(TRANSFER_URL));

    expect(result).toMatchObject({ name: 'SessionTransferError', code: 'browser_unavailable' });
    expect(result).not.toHaveProperty('cause');
    expect(String(result)).not.toContain('one-time');
    expect(mocks.removeSubscription).toHaveBeenCalled();
  });
});
