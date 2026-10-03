import { test, expect } from '../../fixtures.ts';
import { nativeAuth } from '../../native.ts';

test('nativeAuth shows the native AuthView start screen without a tap', async ({ host, screen, platform }) => {
  const state = await host.launch({ instance: 'with-email-codes', screen: 'nativeAuth' });
  expect(state.screen).toBe('nativeAuth');
  expect(state.signedIn).toBe(false);
  await expect(nativeAuth(screen, platform).identifier).toBeVisible({ timeout: 30_000 });
  const loaded = await host.waitForState((s) => s.extra?.authViewLoaded === true, 20_000);
  expect(loaded.lastError).toBeNull();
  await host.screenshot('native-auth');
});

test('dismissing AuthView returns to the JS home screen', { platforms: ['ios'] }, async ({ host, screen }) => {
  await host.launch({ instance: 'with-email-codes', screen: 'nativeAuth' });
  await expect(screen.getByTestId('clerk.auth.start.identifier')).toBeVisible({ timeout: 30_000 });
  await host.tap(screen.getByTestId('clerk.dismissButton'));
  const state = await host.waitForState((s) => s.screen === 'home', 15_000);
  expect(state.signedIn).toBe(false);
  await expect(screen.getByTestId('open-auth-view-button')).toBeVisible();
  await host.screenshot('dismissed-home');
});
