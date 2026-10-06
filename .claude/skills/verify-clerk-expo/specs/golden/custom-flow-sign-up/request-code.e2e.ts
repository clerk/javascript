import { test, expect } from '../../fixtures.ts';

test('useSignUp sends an email code to a new test address', { tags: ['form-entry'] }, async ({ host, screen }) => {
  const email = await host.newEmail();
  const launched = await host.launch({ screen: 'customSignUp' });
  await host.fill(screen.getByTestId('verify.customSignUp.emailAddress'), email);
  await host.fill(screen.getByTestId('verify.customSignUp.password'), `Verify-${launched.runId}-Pw1!`);
  await host.tap(screen.getByTestId('verify.customSignUp.sendCode'));
  await expect(screen.getByTestId('verify.customSignUp.code')).toBeVisible({ timeout: 20_000 });
  const state = await host.waitForState(s => s.signUpStatus === 'missing_requirements', 15_000);
  expect(state.signedIn).toBe(false);
  await host.screenshot('custom-signup-code');
});
