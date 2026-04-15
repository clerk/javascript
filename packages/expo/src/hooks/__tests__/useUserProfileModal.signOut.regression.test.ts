/**
 * Named regression tests for useUserProfileModal.
 *
 * Each test in this file corresponds to a user-visible bug that shipped a fix
 * in the chris/fix-inline-authview-sso branch. They are intentionally named
 * after the bug so that future engineers do not delete them while refactoring.
 *
 * If you change useUserProfileModal.ts and one of these fails, the bug came back.
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    useClerk: vi.fn(),
    useUser: vi.fn(),
    isNativeSupported: true,
    ClerkExpoModule: {
      configure: vi.fn(),
      getSession: vi.fn(),
      getClientToken: vi.fn(),
      presentUserProfile: vi.fn(),
      signOut: vi.fn(),
    } as Record<string, any> | null,
    tokenCache: {
      getToken: vi.fn(),
      saveToken: vi.fn(),
    } as Record<string, any> | null,
  };
});

vi.mock('@clerk/react', () => ({
  useClerk: mocks.useClerk,
  useUser: mocks.useUser,
}));

vi.mock('../../utils/native-module', () => ({
  get isNativeSupported() {
    return mocks.isNativeSupported;
  },
  get ClerkExpoModule() {
    return mocks.ClerkExpoModule;
  },
}));

vi.mock('../../token-cache', () => ({
  get tokenCache() {
    return mocks.tokenCache;
  },
}));

import { useUserProfileModal } from '../useUserProfileModal';

const FAKE_PUB_KEY = 'pk_test_x';
const FAKE_TOKEN = 'token_xyz';
const NATIVE_SESSION = { sessionId: 'sess_native' };

let mockClerk: { publishableKey: string; signOut: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isNativeSupported = true;
  mocks.ClerkExpoModule = {
    configure: vi.fn().mockResolvedValue(undefined),
    getSession: vi.fn().mockResolvedValue(null),
    getClientToken: vi.fn().mockResolvedValue(null),
    presentUserProfile: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mocks.tokenCache = {
    getToken: vi.fn().mockResolvedValue(null),
    saveToken: vi.fn().mockResolvedValue(undefined),
  };
  mockClerk = {
    publishableKey: FAKE_PUB_KEY,
    signOut: vi.fn().mockResolvedValue(undefined),
  };
  mocks.useClerk.mockReturnValue(mockClerk);
  mocks.useUser.mockReturnValue({ user: { id: 'user_x' } });
});

describe('useUserProfileModal regressions', () => {
  test('does not sign out the JS SDK when native never had a session before the modal opened', async () => {
    // Reproduces: the "Get Help loop" bug.
    // Pre-modal: native has no session, JS user exists, token cache empty.
    // After dismissing the profile modal (without doing anything), the hook
    // must NOT sign out the JS SDK — that would log the user out for no reason.
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // pre-check
      .mockResolvedValueOnce(null); // post-modal
    mocks.tokenCache!.getToken.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useUserProfileModal());
    await act(async () => {
      await result.current.presentUserProfile();
    });

    expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });

  test('signs out the JS SDK when native had a session and the user pressed Sign Out in the profile modal', async () => {
    // Native had a session before the modal, the user signed out from inside
    // the profile modal, so the post-modal getSession returns null. The hook
    // must propagate the sign-out to the JS SDK so useAuth() updates.
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce(NATIVE_SESSION) // pre-check
      .mockResolvedValueOnce(null); // post-modal: signed out

    const { result } = renderHook(() => useUserProfileModal());
    await act(async () => {
      await result.current.presentUserProfile();
    });

    expect(mocks.ClerkExpoModule!.signOut).toHaveBeenCalledTimes(1);
    expect(mockClerk.signOut).toHaveBeenCalledTimes(1);
  });

  test('re-syncs the JS bearer token to native when the user signed in via custom sign-in and then opens the profile modal', async () => {
    // The "JS-to-native pre-sync" path. The user authenticated via a custom
    // JS sign-in form, so the JS SDK has a session but the native SDK does not.
    // When they tap UserButton, the hook must push the JS bearer token to the
    // native SDK BEFORE presenting the modal so the modal renders correctly.
    mocks
      .ClerkExpoModule!.getSession.mockResolvedValueOnce(null) // pre-check: native empty
      .mockResolvedValueOnce(NATIVE_SESSION) // post-configure: now hydrated
      .mockResolvedValueOnce(NATIVE_SESSION); // post-modal: still active
    mocks.tokenCache!.getToken.mockResolvedValueOnce(FAKE_TOKEN);

    const { result } = renderHook(() => useUserProfileModal());
    await act(async () => {
      await result.current.presentUserProfile();
    });

    expect(mocks.ClerkExpoModule!.configure).toHaveBeenCalledWith(FAKE_PUB_KEY, FAKE_TOKEN);
    expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(1);
    // Native session is still alive after dismiss → no sign-out
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });

  test('does not loop through Get Help -> back -> Get Help when there is no native session', async () => {
    // Open the profile modal twice in a row with no native session in between.
    // Each open/close cycle must NOT trigger a sign-out.
    mocks.ClerkExpoModule!.getSession.mockResolvedValue(null);
    mocks.tokenCache!.getToken.mockResolvedValue(null);

    const { result } = renderHook(() => useUserProfileModal());

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await result.current.presentUserProfile();
      });
    }

    expect(mocks.ClerkExpoModule!.presentUserProfile).toHaveBeenCalledTimes(3);
    expect(mocks.ClerkExpoModule!.signOut).not.toHaveBeenCalled();
    expect(mockClerk.signOut).not.toHaveBeenCalled();
  });
});
