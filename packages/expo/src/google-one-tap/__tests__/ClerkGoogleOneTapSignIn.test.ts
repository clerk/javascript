import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ClerkGoogleOneTapSignIn } from '../ClerkGoogleOneTapSignIn';

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  createAccount: vi.fn(),
  presentExplicitSignIn: vi.fn(),
}));

vi.mock('../../specs/NativeClerkGoogleSignIn', () => ({
  default: {
    configure: vi.fn(),
    signIn: mocks.signIn,
    createAccount: mocks.createAccount,
    presentExplicitSignIn: mocks.presentExplicitSignIn,
    signOut: vi.fn(),
  },
}));

const nativeError = (message: string) => Object.assign(new Error(message), { code: 'SIGN_IN_CANCELLED' });

const methods = [
  ['signIn', mocks.signIn, () => ClerkGoogleOneTapSignIn.signIn()],
  ['createAccount', mocks.createAccount, () => ClerkGoogleOneTapSignIn.createAccount()],
  ['presentExplicitSignIn', mocks.presentExplicitSignIn, () => ClerkGoogleOneTapSignIn.presentExplicitSignIn()],
] as const;

describe('ClerkGoogleOneTapSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.each(methods)('%s', (_name, nativeMethod, call) => {
    // Messages androidx.credentials and Play services emit when the user dismisses the chooser.
    test.each([
      'User cancelled the sign-in flow',
      'activity is cancelled by the user.',
      'User cancelled the selector',
      '[16] Cancelled by user.',
      '[16] Canceled by user.',
    ])('treats %j as a cancellation', async message => {
      nativeMethod.mockRejectedValue(nativeError(message));

      await expect(call()).resolves.toEqual({ type: 'cancelled', data: null });
    });

    // Play services reuses status 16 for failures the user did not trigger.
    test.each([
      '[16] Account reauth failed.',
      '16: Account reauth failed.',
      '[10] Developer console is not set up correctly.',
    ])('surfaces %j as a provider failure', async message => {
      nativeMethod.mockRejectedValue(nativeError(message));

      await expect(call()).rejects.toMatchObject({ code: 'GOOGLE_SIGN_IN_ERROR', message });
    });
  });
});
