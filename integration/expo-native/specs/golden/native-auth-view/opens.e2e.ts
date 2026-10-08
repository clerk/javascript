import { test, expect } from '../../fixtures.ts';
import { closeNativeAuth, homeLinks, nativeAuth } from '../../native.ts';

test('the home full-screen sign-in button shows AuthView with no close button', async ({ host, screen, platform }) => {
  await host.launch();
  await host.tap(host.app.signInFullScreen);
  await expect(nativeAuth(screen, platform).identifier).toBeVisible({ timeout: 20_000 });
  if (platform === 'ios') await expect(screen.getByTestId('clerk.dismissButton')).toHaveCount(0);
  await host.screenshot('auth-full-screen');
});

test('closing the AuthView that the home opened returns to the home', async ({ host, screen, device, platform }) => {
  const identifier = nativeAuth(screen, platform).identifier;
  await host.launch();
  await host.expectSignedOut();
  await host.tap(host.app.signIn);
  await expect(identifier).toBeVisible({ timeout: 20_000 });
  await host.screenshot('auth-from-home');
  await closeNativeAuth(screen, device, platform);
  await host.expectSignedOut(15_000);
  await expect(host.app.signIn).toBeVisible();
  await expect(identifier).toHaveCount(0);
  await host.screenshot('closed-modal');
});

test(
  'the close button of a full-screen AuthView returns to the home',
  { platforms: ['ios'] },
  async ({ host, screen }) => {
    await host.launch();
    await host.tap(homeLinks(screen).nativeAuth);
    await host.tap(screen.getByTestId('clerk.dismissButton').last());
    await host.expectSignedOut(15_000);
    await expect(host.app.signIn).toBeVisible();
    await host.screenshot('dismissed-home');
  },
);
