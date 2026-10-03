import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';

test('useSignUp completes with the email code', { tags: ['form-entry'] }, async ({ host, screen }) => {
  const email = await host.newEmail('with-email-codes');
  const launched = await host.launch({ instance: 'with-email-codes', screen: 'customSignUp' });
  await host.fill(screen.getByTestId('verify.customSignUp.emailAddress'), email);
  await host.fill(screen.getByTestId('verify.customSignUp.password'), `Verify-${launched.runId}-Pw1!`);
  await host.tap(screen.getByTestId('verify.customSignUp.sendCode'));
  await expect(screen.getByTestId('verify.customSignUp.code')).toBeVisible({ timeout: 20_000 });
  await host.screenshot('custom-signup-code');
  await host.fill(screen.getByTestId('verify.customSignUp.code'), CLERK_TEST_CODE);
  await host.tap(screen.getByTestId('verify.customSignUp.verifyCode'));
  const state = await host.waitForState((s) => s.signedIn && s.sessionStatus === 'active', 30_000);
  expect(state.userId).not.toBeNull();
  await host.screenshot('custom-signed-up');
});
