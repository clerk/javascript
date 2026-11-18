import Module from 'node:module';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent?: unknown, isMain?: boolean) => unknown;
};
const originalModuleLoad = moduleWithLoad._load;

const mocks = vi.hoisted(() => ({
  platformOS: 'ios' as string,
  application: null as Record<string, string | null> | null,
  executionEnvironment: 'standalone' as string,
}));

vi.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: vi.fn() },
  Platform: {
    get OS() {
      return mocks.platformOS;
    },
  },
}));

const loadIdentity = async () => import('../nativeAppIdentity');

describe('nativeAppIdentity', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.platformOS = 'ios';
    mocks.executionEnvironment = 'standalone';
    mocks.application = {
      applicationId: 'com.example.app',
      nativeApplicationVersion: '4.8.4',
      nativeBuildVersion: '41',
    };
    vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'expo-application') {
        if (!mocks.application) {
          throw new Error("Cannot find module 'expo-application'");
        }
        return mocks.application;
      }
      if (request === 'expo-constants') {
        return { default: { executionEnvironment: mocks.executionEnvironment, appOwnership: null } };
      }
      return originalModuleLoad.call(Module, request, parent, isMain);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('identifies an iOS app by its bundle ID and version', async () => {
    const { getNativeAppIdentity } = await loadIdentity();

    expect(getNativeAppIdentity()).toEqual({
      platform: 'ios',
      appIdentifier: 'com.example.app',
      version: '4.8.4',
      displayVersion: '4.8.4',
    });
  });

  test('identifies an Android app by its package name and version code', async () => {
    mocks.platformOS = 'android';
    const { getNativeAppIdentity } = await loadIdentity();

    expect(getNativeAppIdentity()).toEqual({
      platform: 'android',
      appIdentifier: 'com.example.app',
      version: '41',
      displayVersion: '4.8.4',
    });
  });

  test('sends the identity headers for iOS', async () => {
    const { setNativeAppIdentityHeaders } = await loadIdentity();
    const headers = new Headers();

    setNativeAppIdentityHeaders(headers);

    expect(headers.get('x-bundle-id')).toBe('com.example.app');
    expect(headers.get('x-package-name')).toBeNull();
    expect(headers.get('x-app-version')).toBe('4.8.4');
  });

  test('sends the identity headers for Android', async () => {
    mocks.platformOS = 'android';
    const { setNativeAppIdentityHeaders } = await loadIdentity();
    const headers = new Headers();

    setNativeAppIdentityHeaders(headers);

    expect(headers.get('x-package-name')).toBe('com.example.app');
    expect(headers.get('x-bundle-id')).toBeNull();
    expect(headers.get('x-app-version')).toBe('41');
  });

  test.each([
    ['in Expo Go', () => (mocks.executionEnvironment = 'storeClient')],
    ['on the web', () => (mocks.platformOS = 'web')],
    ['without expo-application', () => (mocks.application = null)],
    ['without an app version', () => (mocks.application = { ...mocks.application, nativeApplicationVersion: null })],
  ])('sends no identity %s', async (_label, arrange) => {
    arrange();
    const { getNativeAppIdentity, setNativeAppIdentityHeaders } = await loadIdentity();
    const headers = new Headers();

    setNativeAppIdentityHeaders(headers);

    expect(getNativeAppIdentity()).toBeNull();
    expect([...headers.keys()]).toEqual([]);
  });
});
