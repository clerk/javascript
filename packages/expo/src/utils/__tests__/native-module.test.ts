import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  nativeModule: undefined as unknown,
}));

const makeNativeModule = ({ includeEventMethods = true } = {}) => ({
  ...(includeEventMethods
    ? {
        addListener: vi.fn(),
      }
    : {}),
  configure: vi.fn(),
  getClientToken: vi.fn(),
  syncClientStateFromJs: vi.fn(),
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
    vi.clearAllMocks();
    mocks.nativeModule = undefined;
  });

  test('returns the generated native module when it satisfies the bootstrap contract', async () => {
    mocks.nativeModule = makeNativeModule();

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBe(mocks.nativeModule);
  });

  test('returns the generated Android module when it satisfies the bootstrap contract without event methods', async () => {
    mocks.nativeModule = makeNativeModule({ includeEventMethods: false });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBe(mocks.nativeModule);
  });

  test('returns null when no native module satisfies the bootstrap contract', async () => {
    mocks.nativeModule = {
      configure: vi.fn(),
    };

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
  });
});
