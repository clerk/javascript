import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireNativeView: vi.fn(() => {
    throw new Error('requireNativeView should not be called on web');
  }),
}));

vi.mock('expo', () => ({
  requireNativeView: mocks.requireNativeView,
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

async function importNativeViews() {
  const [authView, userProfileView, userButtonView] = await Promise.all([
    import('../NativeClerkAuthView'),
    import('../NativeClerkUserProfileView'),
    import('../NativeClerkUserButtonView'),
  ]);

  return [authView.default, userProfileView.default, userButtonView.default] as const;
}

describe('native view specs on web', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('do not require native views at import time', async () => {
    const [authView, userProfileView, userButtonView] = await importNativeViews();

    expect(authView).toBeNull();
    expect(userProfileView).toBeNull();
    expect(userButtonView).toBeNull();
    expect(mocks.requireNativeView).not.toHaveBeenCalled();
  });
});
