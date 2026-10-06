import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';

test('useSignIn completes with the email code', { tags: ['form-entry'] }, async ({ host, screen }) => {
  const user = await host.seedUser();
  await host.launch({ screen: 'customSignIn' });
  await host.fill(screen.getByTestId('verify.customSignIn.emailAddress'), user.email);
  await host.tap(screen.getByTestId('verify.customSignIn.sendCode'));
  await expect(screen.getByTestId('verify.customSignIn.code')).toBeVisible({ timeout: 20_000 });
  await host.screenshot('custom-code');
  await host.fill(screen.getByTestId('verify.customSignIn.code'), CLERK_TEST_CODE);
  await host.tap(screen.getByTestId('verify.customSignIn.verifyCode'));
  const state = await host.waitForState(s => s.signedIn && s.sessionStatus === 'active', 30_000);
  expect(state.userId).toBe(user.id);
  await host.screenshot('custom-signed-in');
});
