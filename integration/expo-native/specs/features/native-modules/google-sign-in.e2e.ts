import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

const GOOGLE_UI_TIMEOUT_MS = 30_000;

test('useSignInWithGoogle opens the native Google sign-in, and cancelling it ends the flow with no session', async ({
  host,
  screen,
  device,
  platform,
}) => {
  const googleResult = screen.getByTestId('google-result');
  const googlePage = screen.getByTestId(/^com\.google\.android\.gms:id\//);
  await host.launch();
  await host.tap(homeLinks(screen).nativeModules);
  await host.tap(screen.getByTestId('google-sign-in-button'));
  if (platform === 'android') {
    // Google Play services keeps its add-account flow running after the app is force-stopped, and its next page later covers whatever app is in front.
    await expect
      .poll(() => googlePage.count().catch(() => 0), {
        timeout: GOOGLE_UI_TIMEOUT_MS,
        message: 'a page of Google Play services is on screen',
      })
      .toBeGreaterThan(0);
  } else {
    await expect(screen.getByText(/accounts\.google\.com/)).toBeVisible({ timeout: GOOGLE_UI_TIMEOUT_MS });
  }
  await host.screenshot('google-system-prompt');
  if (platform === 'android') {
    await expect
      .poll(
        async () => {
          if ((await googlePage.count().catch(() => 0)) > 0) await device.back();
          return googleResult.count().catch(() => 0);
        },
        { timeout: GOOGLE_UI_TIMEOUT_MS, message: 'backing out of Google Play services returns the app a result' },
      )
      .toBeGreaterThan(0);
  } else {
    await device.alert('dismiss');
  }
  await expect(googleResult).toHaveText('Google sign-in was cancelled', { timeout: 15_000 });
  await host.screenshot('google-cancelled');
});
