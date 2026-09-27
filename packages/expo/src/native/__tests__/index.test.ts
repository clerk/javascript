import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const importNativeEntry = () => import('../index');

describe('@clerk/expo/native', () => {
  afterEach(() => {
    vi.doUnmock('../loadClerkExpoNative');
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('when @clerk/expo-native is not installed', () => {
    beforeEach(() => {
      vi.doMock('../loadClerkExpoNative', () => ({ loadClerkExpoNative: () => null }));
    });

    test.each(['AuthView', 'UserButton', 'UserProfileView'] as const)(
      'rendering %s throws an error with install instructions',
      async name => {
        const Component = (await importNativeEntry())[name] as (props: object) => unknown;

        expect(() => Component({})).toThrow(
          /`.+` is unavailable\. Native components have moved to the @clerk\/expo-native package\. Install it with `npx expo install @clerk\/expo-native`/,
        );
      },
    );

    test.each(['useAuthViewState', 'useUserProfileCustomPageNavigation'] as const)(
      'calling %s throws an error with install instructions',
      async name => {
        const hook = (await importNativeEntry())[name] as () => unknown;

        expect(() => hook()).toThrow(`\`${name}\` is unavailable.`);
        expect(() => hook()).toThrow('add "@clerk/expo-native" to the plugins array in your app config');
      },
    );
  });

  test('re-exports @clerk/expo-native when it is installed', async () => {
    const clerkExpoNative = {
      AuthView: vi.fn(() => null),
      UserButton: vi.fn(() => null),
      UserProfileView: vi.fn(() => null),
      useAuthViewState: vi.fn(),
      useUserProfileCustomPageNavigation: vi.fn(),
    };
    vi.doMock('../loadClerkExpoNative', () => ({ loadClerkExpoNative: () => clerkExpoNative }));

    const nativeEntry = await importNativeEntry();

    expect(nativeEntry.AuthView).toBe(clerkExpoNative.AuthView);
    expect(nativeEntry.UserButton).toBe(clerkExpoNative.UserButton);
    expect(nativeEntry.UserProfileView).toBe(clerkExpoNative.UserProfileView);
    expect(nativeEntry.useAuthViewState).toBe(clerkExpoNative.useAuthViewState);
    expect(nativeEntry.useUserProfileCustomPageNavigation).toBe(clerkExpoNative.useUserProfileCustomPageNavigation);
  });
});
