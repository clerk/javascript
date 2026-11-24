import { deviceCommand } from '@clerk/internal-mobile-e2e/specs/support/device';
import { readTarget } from '@clerk/internal-mobile-e2e/specs/support/inputs';
import { app } from '../../app.ts';
import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

const GOOGLE_UI_TIMEOUT_MS = 30_000;
const BACK_OUT_MS = 5_000;
const SELF_CLOSE_MS = 5_000;
const PAGE_READ_MS = 5_000;
const ANDROID_NO_SESSION_RESULT = /^Google sign-in (was cancelled|failed: No credentials available)$/;

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
  const resultShows = (timeout: number) =>
    expect
      .poll(() => googleResult.count().catch(() => 0), { timeout })
      .toBeGreaterThan(0)
      .then(
        () => true,
        () => false,
      );
  const googlePageOpen = async () => {
    let open = false;
    await expect
      .poll(
        async () => {
          open = (await googlePage.count()) > 0;
          return true;
        },
        { timeout: PAGE_READ_MS, message: 'a read of the screen succeeds' },
      )
      .toBe(true);
    return open;
  };
  try {
    let ended = true;
    if (platform === 'android') {
      await expect
        .poll(() => googlePage.count().catch(() => 0), {
          timeout: GOOGLE_UI_TIMEOUT_MS,
          message: 'a page of Google Play services is on screen',
        })
        .toBeGreaterThan(0);
      ended = await resultShows(SELF_CLOSE_MS);
      if (!ended) {
        if (await googlePageOpen()) await device.back();
        ended = await resultShows(BACK_OUT_MS);
        if (!ended) {
          if (await googlePageOpen()) {
            await forceStopGooglePlayServices();
          } else {
            ended = await resultShows(BACK_OUT_MS);
            if (!ended) throw new Error("Google's page closed, but the app showed no result");
          }
        }
      }
      await expect(googlePage).toHaveCount(0, { timeout: 15_000 });
    } else {
      await expect(screen.getByText(/accounts\.google\.com/)).toBeVisible({ timeout: GOOGLE_UI_TIMEOUT_MS });
      await host.screenshot('google-system-prompt');
      await device.alert('dismiss');
    }
    if (ended) {
      await expect(googleResult).toHaveText(
        platform === 'android' ? ANDROID_NO_SESSION_RESULT : 'Google sign-in was cancelled',
        { timeout: 15_000 },
      );
      await host.screenshot('google-cancelled');
    }
  } catch (error) {
    // Without a Google account, Google Play services can show a page that back does not close, and its add-account flow outlives the app and covers the next test.
    if (platform === 'android') await forceStopGooglePlayServices().catch(() => {});
    throw error;
  }
});
