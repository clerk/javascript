import { afterEach, describe, expect, test, vi } from 'vitest';

const nativeComponentsEntry = vi.hoisted(() => ({
  AuthView: () => null,
  UserButton: () => null,
  UserProfileView: () => null,
  useAuthViewState: () => null,
  useUserProfileCustomPageNavigation: () => null,
}));
const deprecated = vi.hoisted(() => vi.fn());

vi.mock('../../native-components', () => nativeComponentsEntry);
vi.mock('@clerk/shared/deprecated', () => ({ deprecated }));

describe('@clerk/expo/native', () => {
  afterEach(() => {
    vi.resetModules();
    deprecated.mockClear();
  });

  test('re-exports everything from @clerk/expo/native-components', async () => {
    const nativeEntry = await import('../index');

    expect({ ...nativeEntry }).toEqual(nativeComponentsEntry);
  });

  test('warns that the entry point is deprecated when it is imported', async () => {
    await import('../index');

    expect(deprecated).toHaveBeenCalledExactlyOnceWith(
      '@clerk/expo/native',
      'Import from `@clerk/expo/native-components` instead.',
    );
  });
});
