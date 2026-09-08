import { expect, expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, tapControl, test } from './flows';

// A custom page's React Native content is mounted as a child of the native host
// and rehosted into the destination its row pushes, then survives the trip back.
test('UserProfileView renders a custom page', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);
  await device.getByTestId('open-embedded-profile-button').tap();

  // The row list lands a frame after the native profile paints.
  await expect(device.getByText('E2E Custom Page')).toBeVisible({ timeout: 20_000 });
  await tapControl(device, 'E2E Custom Page');
  await expect(device.getByText('Rehosted RN body')).toBeVisible({ timeout: 15_000 });

  // The Android destination is a bare AndroidView with no back chrome, unlike
  // the iOS page which clerk-ios pushes onto its own NavigationStack.
  if (platform === 'android') {
    await device.goBack();
  } else {
    await tapControl(device, 'Back');
  }
  await expect(device.getByText('E2E Custom Page')).toBeVisible({ timeout: 15_000 });

  // The host chevron firing onHostBack, which reads 'Back' on both platforms.
  await tapControl(device, 'Back');
  await expect(device.getByTestId('open-embedded-profile-button')).toBeVisible({ timeout: 15_000 });
  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
