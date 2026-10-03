import { test, expect } from '../../fixtures.ts';
import { closeStrongPasswordSheet } from '../../native.ts';

test('useSignUp sends an email code to a new test address', async ({ host, screen }) => {
  const email = await host.newEmail('with-email-codes');
  const launched = await host.launch({ instance: 'with-email-codes', screen: 'customSignUp' });
  await host.fill(screen.getByTestId('verify.customSignUp.emailAddress'), email);
  await host.tap(screen.getByTestId('verify.customSignUp.password'));
  await closeStrongPasswordSheet(screen, (target) => host.tap(target));
  await host.fill(screen.getByTestId('verify.customSignUp.password'), `Verify-${launched.runId}-Pw1!`);
  await closeStrongPasswordSheet(screen, (target) => host.tap(target));
  await host.tap(screen.getByTestId('verify.customSignUp.sendCode'));
  await expect(screen.getByTestId('verify.customSignUp.code')).toBeVisible({ timeout: 20_000 });
  const state = await host.waitForState((s) => s.signUpStatus === 'missing_requirements', 15_000);
  expect(state.signedIn).toBe(false);
  await host.screenshot('custom-signup-code');
});
