import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

const GOOGLE_UI_TIMEOUT_MS = 30_000;
const LEAVE_GOOGLE_TIMEOUT_MS = 45_000;

test('cancelling the native Google sign-in that useSignInWithGoogle opened ends the flow with no session', async ({
  host,
  screen,
  device,
  platform,
}) => {
  await host.launch();
  await host.tap(homeLinks(screen).nativeModules);
  const button = screen.getByTestId('google-sign-in-button');
  const result = screen.getByTestId('google-result');
  await host.tap(button);
  if (platform === 'ios') {
    await expect(screen.getByText(/accounts\.google\.com/)).toBeVisible({ timeout: GOOGLE_UI_TIMEOUT_MS });
    await host.screenshot('google-system-prompt');
    await device.alert('dismiss');
  } else {
    await expect(button).toBeHidden({ timeout: GOOGLE_UI_TIMEOUT_MS });
    const skip = screen.getByRole('button', { name: /^skip$/i });
    for (
      const until = Date.now() + LEAVE_GOOGLE_TIMEOUT_MS;
      Date.now() < until && (await result.count()) === 0 && (await button.count()) === 0;
    ) {
      if ((await skip.count()) > 0) await host.tap(skip);
      else await device.back();
      await new Promise(resolve => setTimeout(resolve, 2_000));
    }
  }
  await expect(result).toHaveText('Google sign-in was cancelled', { timeout: 15_000 });
  await host.screenshot('google-cancelled');
});
