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
  prepareCore: vi.fn(),
  startCore: vi.fn(),
  receiveCoreMessage: vi.fn(),
  detachCore: vi.fn(),
  performCoreCapability: vi.fn(),
  cancelCoreCapabilities: vi.fn(),
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

  test('rejects a module without the resource event transport', async () => {
    mocks.nativeModule = makeNativeModule({ includeEventMethods: false });

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
  });

  test('returns null when no native module satisfies the bootstrap contract', async () => {
    mocks.nativeModule = {
      configure: vi.fn(),
    };

    const { ClerkExpoModule } = await importNativeModule();

    expect(ClerkExpoModule).toBeNull();
  });
});
