import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

const GOOGLE_UI_TIMEOUT_MS = 30_000;

test('useSignInWithGoogle opens the native Google sign-in, and cancelling it on iOS ends the flow with no session', async ({
  host,
  screen,
  device,
  platform,
}) => {
  await host.launch();
  await host.tap(homeLinks(screen).nativeModules);
  await host.tap(screen.getByTestId('google-sign-in-button'));
  if (platform === 'android') {
    const googlePage = screen.getByTestId(/^com\.google\.android\.gms:id\//);
    let opened = false;
    for (const until = Date.now() + GOOGLE_UI_TIMEOUT_MS; !opened && Date.now() < until; ) {
      opened = await googlePage.count().then(
        count => count > 0,
        () => false,
      );
      if (!opened) await new Promise(resolve => setTimeout(resolve, 1_000));
    }
    expect(opened, 'a page of Google Play services is on screen').toBe(true);
    return;
  }
  await expect(screen.getByText(/accounts\.google\.com/)).toBeVisible({ timeout: GOOGLE_UI_TIMEOUT_MS });
  await host.screenshot('google-system-prompt');
  await device.alert('dismiss');
  await expect(screen.getByTestId('google-result')).toHaveText('Google sign-in was cancelled', { timeout: 15_000 });
  await host.screenshot('google-cancelled');
});
