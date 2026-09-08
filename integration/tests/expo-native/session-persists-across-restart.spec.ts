import { expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, test } from './flows';

// Sign in via the native AuthView, restart WITHOUT clearing state, and assert
// the session is restored from secure-store with no re-auth (bridge + token
// cache persistence).
test('Session persists across app restart', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);

  await device.relaunch();
  await expectSignedIn(device, 45_000);

  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
