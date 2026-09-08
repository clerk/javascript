import { expect, openApp, test } from './flows';

test('useSignInWithGoogle surfaces the missing-credentials error', async ({ device }) => {
  await openApp(device);
  await device.getByTestId('google-sign-in-button').tap();
  await expect(device.getByTestId('google-result')).toHaveText('Google Sign-In credentials not found', {
    timeout: 15_000,
  });
});
