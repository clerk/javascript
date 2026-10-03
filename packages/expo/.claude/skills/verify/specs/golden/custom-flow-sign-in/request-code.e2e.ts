import { test, expect } from '../../fixtures.ts';

test('useSignIn sends an email code to an existing test user', async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  const launched = await host.launch({ instance: 'with-email-codes', screen: 'customSignIn' });
  expect(launched.signedIn).toBe(false);
  await host.fill(screen.getByTestId('verify.customSignIn.emailAddress'), user.email);
  await host.tap(screen.getByTestId('verify.customSignIn.sendCode'));
  await expect(screen.getByTestId('verify.customSignIn.code')).toBeVisible({ timeout: 20_000 });
  const state = await host.waitForState((s) => s.signInStatus === 'needs_first_factor', 15_000);
  expect(state.signedIn).toBe(false);
  await host.screenshot('custom-code');
});
