import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../useAuthViewState', () => ({ useAuthViewState: vi.fn() }));

const importNativeEntry = () => import('../index');

describe('@clerk/expo/native', () => {
  afterEach(() => {
    vi.doUnmock('../loadClerkExpoNative');
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('when @clerk/expo-native-components is not installed', () => {
    beforeEach(() => {
      vi.doMock('../loadClerkExpoNative', () => ({ loadClerkExpoNative: () => null }));
    });

    test.each(['AuthView', 'UserButton', 'UserProfileView'] as const)(
      'rendering %s throws an error with install instructions',
      async name => {
        const Component = (await importNativeEntry())[name] as (props: object) => unknown;

        expect(() => Component({})).toThrow(
          /`.+` is unavailable\. Native components have moved to the @clerk\/expo-native-components package\. Install it with `npx expo install @clerk\/expo-native-components`/,
        );
      },
    );

    test('calling useUserProfileCustomPageNavigation throws an error with install instructions', async () => {
      const hook = (await importNativeEntry()).useUserProfileCustomPageNavigation as () => unknown;

      expect(() => hook()).toThrow('`useUserProfileCustomPageNavigation` is unavailable.');
      expect(() => hook()).toThrow('add "@clerk/expo-native-components" to the plugins array in your app config');
    });

    test('exports its own useAuthViewState', async () => {
      const nativeEntry = await importNativeEntry();
      const { useAuthViewState } = await import('../useAuthViewState');

      expect(nativeEntry.useAuthViewState).toBe(useAuthViewState);
    });
  });

  test('re-exports @clerk/expo-native-components when it is installed', async () => {
    const clerkExpoNative = {
      AuthView: vi.fn(() => null),
      UserButton: vi.fn(() => null),
      UserProfileView: vi.fn(() => null),
      useUserProfileCustomPageNavigation: vi.fn(),
    };
    vi.doMock('../loadClerkExpoNative', () => ({ loadClerkExpoNative: () => clerkExpoNative }));

    const nativeEntry = await importNativeEntry();

    expect(nativeEntry.AuthView).toBe(clerkExpoNative.AuthView);
    expect(nativeEntry.UserButton).toBe(clerkExpoNative.UserButton);
    expect(nativeEntry.UserProfileView).toBe(clerkExpoNative.UserProfileView);
    expect(nativeEntry.useUserProfileCustomPageNavigation).toBe(clerkExpoNative.useUserProfileCustomPageNavigation);
  });
});
