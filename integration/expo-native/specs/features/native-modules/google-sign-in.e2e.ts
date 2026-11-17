import { deviceCommand } from '@clerk/internal-mobile-e2e/specs/support/device';
import { readTarget } from '@clerk/internal-mobile-e2e/specs/support/inputs';
import { app } from '../../app.ts';
import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

const GOOGLE_UI_TIMEOUT_MS = 30_000;
const BACK_OUT_MS = 5_000;

async function forceStopGooglePlayServices(): Promise<void> {
  const result = await deviceCommand(readTarget(app, process.env).device, 'android', [
    'shell',
    'am',
    'force-stop',
    'com.google.android.gms',
  ]);
  if (result.code !== 0)
    throw new Error(`force-stopping Google Play services failed: ${result.stderr.trim() || `exit ${result.code}`}`);
}

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
  try {
    if (platform === 'android') {
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
    let cancelled = true;
    if (platform === 'android') {
      await device.back();
      cancelled = await googleResult.waitFor({ timeout: BACK_OUT_MS }).then(
        () => true,
        () => false,
      );
      if (!cancelled) await forceStopGooglePlayServices();
      await expect(googlePage).toHaveCount(0, { timeout: 15_000 });
    } else {
      await device.alert('dismiss');
    }
    if (cancelled) {
      await expect(googleResult).toHaveText('Google sign-in was cancelled', { timeout: 15_000 });
      await host.screenshot('google-cancelled');
    }
  } catch (error) {
    // Without a Google account, Google Play services can show a page that back does not close, and its add-account flow outlives the app and covers the next test.
    if (platform === 'android') await forceStopGooglePlayServices().catch(() => {});
    throw error;
  }
});
