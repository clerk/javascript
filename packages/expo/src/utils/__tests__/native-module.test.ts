import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nativeModule: undefined as unknown,
}));

const makeNativeModule = ({
  includeEventMethods = true,
  bridgeVersion,
}: { includeEventMethods?: boolean; bridgeVersion?: number } = {}) => ({
  ...(bridgeVersion === undefined ? {} : { bridgeVersion }),
  ...(includeEventMethods
    ? {
        addListener: vi.fn(),
      }
    : {}),
  configureNative: vi.fn(),
  getDeviceToken: vi.fn(),
  setDeviceToken: vi.fn(),
  refreshClient: vi.fn(),
});

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

async function importNativeModule() {
  vi.doMock('../../specs/NativeClerkModule', () => ({
    default: mocks.nativeModule,
  }));

  return import('../native-module');
}

describe('native module loader', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mocks.nativeModule = undefined;
  });

  test('returns the generated Android module when it satisfies the bootstrap contract without event methods', async () => {
    mocks.nativeModule = makeNativeModule({ includeEventMethods: false });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBe(mocks.nativeModule);
  });

  test('returns the native module when its bridge version matches', async () => {
    mocks.nativeModule = makeNativeModule({ bridgeVersion: 1 });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBe(mocks.nativeModule);
  });

  test('returns null when a native module reports the expected bridge version without the bridge methods', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.nativeModule = { bridgeVersion: 1, configureNative: vi.fn() };

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('native bridge version 1 is missing bridge methods'));
  });

  test('returns null when the native bridge version is not an integer', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.nativeModule = makeNativeModule({ bridgeVersion: Number.NaN });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
  });

  test('returns null when no native module satisfies the bootstrap contract', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.nativeModule = {
      configureNative: vi.fn(),
    };

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('rebuild the app'));
  });

  test('disables native components and tells the developer to update both packages when the bridge version differs', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.nativeModule = makeNativeModule({ bridgeVersion: 2 });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError.mock.calls[0][0]).toContain('@clerk/expo 0.0.0-test');
    expect(consoleError.mock.calls[0][0]).toContain('@clerk/expo-native-components');
    expect(consoleError.mock.calls[0][0]).toContain('rebuild the app');
  });

  test('stays silent when the app has no native Clerk module', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.nativeModule = null;

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
