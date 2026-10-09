import { expect } from 'e2e';

import { test } from './fixtures.ts';

test.describe('@clerk/expo native modules', () => {
  test.beforeEach(({ po }) => po.app.reset());

  test('useBiometricCredentials reaches the expo-biometrics native module', async ({ screen }) => {
    await screen.getByTestId('biometric-availability-button').tap();
    await expect(screen.getByText(/^biometric availability: /)).toBeVisible({ timeout: 15_000 });
  });
});
