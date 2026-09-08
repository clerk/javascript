import { expectSignedIn, expectSignedOut, openApp, signInWithEmailPassword, test } from './flows';

// Native AuthView email+password sign-in, asserting the native->JS session
// sync, then JS-side sign-out asserting the reverse direction.
test('Native AuthView sign-in syncs to JS', async ({ device, platform }) => {
  await openApp(device);
  await device.getByTestId('open-auth-view-button').tap();
  await signInWithEmailPassword(device, platform);
  await expectSignedIn(device);
  await device.getByTestId('sign-out-button').tap();
  await expectSignedOut(device);
});
