import { expect, expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, test } from './flows';

// Dismiss the native AuthView mid-flow and reopen it: the native view must
// survive detach/reattach and still complete a sign-in afterwards. Dismissal is
// the platform-native gesture: Android's system back button (doubling as the
// back-dismisses-AuthView regression), iOS's sheet Close control (clerk-ios
// exposes the stable clerk.dismissButton identifier).
// Also asserts the custom `logo` React element is rehosted into the native logo
// slot, both on first mount and after reattach.
test('AuthView survives detach and reattach', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await expect(device.getByText(/Welcome! Sign in to continue\.?/)).toBeVisible({ timeout: 25_000 });
  // The rehosted logo is sized on the first React Native layout pass, so it can
  // lag the welcome copy by a frame or two.
  await expect(device.getByText('E2E Custom Logo')).toBeVisible({ timeout: 10_000 });

  if (platform === 'android') {
    await device.goBack();
  } else {
    await device.getByTestId('clerk.dismissButton').tap();
  }

  await expect(device.getByTestId('open-auth-view-button')).toBeVisible({ timeout: 15_000 });
  await device.getByTestId('open-auth-view-button').tap();
  await expect(device.getByText('E2E Custom Logo')).toBeVisible({ timeout: 15_000 });

  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);
  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
