import { expect } from 'e2e';

import { test } from './fixtures.ts';

test.describe('@clerk/expo native modules', () => {
  test.beforeEach(({ po }) => po.app.reset());

  test('useSignInWithGoogle surfaces the missing-credentials error', async ({ screen }) => {
    await screen.getByTestId('google-sign-in-button').tap();
    await expect(screen.getByText(/Google Sign-In credentials not found/)).toBeVisible({ timeout: 15_000 });
  });

  test('useBiometricCredentials reaches the expo-biometrics native module', async ({ screen }) => {
    await screen.getByTestId('biometric-availability-button').tap();
    await expect(screen.getByText(/^biometric availability: /)).toBeVisible({ timeout: 15_000 });
  });
});
