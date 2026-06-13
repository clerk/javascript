import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    platformOS: 'ios',
    requireNativeComponent: vi.fn(name => `react-native:${name}`),
    requireNativeView: vi.fn(name => `expo:${name}`),
  };
});

vi.mock('expo', () => {
  return {
    requireNativeView: mocks.requireNativeView,
  };
});

vi.mock('react-native', () => {
  return {
    Platform: {
      get OS() {
        return mocks.platformOS;
      },
    },
    requireNativeComponent: mocks.requireNativeComponent,
  };
});

describe('getNativeClerkView', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.platformOS = 'ios';
  });

  test('uses React Native native components on iOS', async () => {
    const { getNativeClerkView } = await import('../nativeView');

    expect(getNativeClerkView('ClerkUserButtonView')).toBe('react-native:ClerkUserButtonView');
    expect(mocks.requireNativeComponent).toHaveBeenCalledWith('ClerkUserButtonView');
    expect(mocks.requireNativeView).not.toHaveBeenCalled();
  });

  test('uses Expo native views on Android', async () => {
    mocks.platformOS = 'android';

    const { getNativeClerkView } = await import('../nativeView');

    expect(getNativeClerkView('ClerkUserButtonView')).toBe('expo:ClerkUserButtonView');
    expect(mocks.requireNativeView).toHaveBeenCalledWith('ClerkUserButtonView');
    expect(mocks.requireNativeComponent).not.toHaveBeenCalled();
  });
});
