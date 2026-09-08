import { expect, expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, tapControl, test } from './flows';

// Native UserButton -> account sheet -> native sign-out, asserting the JS layer
// observes it (the reverse bridge direction from sign-in.spec.ts).
//
// Ends with a second sign-in in the SAME app process (no restart, no clean
// state): a past regression had the second native sign-in complete natively
// while the JS SDK never observed it. Every other spec starts from a cleared
// state, so this is the only place that path is exercised.
test('UserButton native sign-out, then same-process re-sign-in', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);

  // iOS labels the trigger 'Open account'; Android 'Open user profile'.
  await device.getByText(/Open (account|user profile)/).tap();
  await expect(device.getByText('Manage account')).toBeVisible({ timeout: 15_000 });
  await expect(device.getByText('Sign out')).toBeVisible();
  await tapControl(device, 'Sign out');
  await expectSignedOut(device);

  // Second sign-in without restarting the app: the remounted AuthView must work
  // and the JS layer must observe the new session.
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);
  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
