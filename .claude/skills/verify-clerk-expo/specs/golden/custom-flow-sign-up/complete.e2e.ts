import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

test('useSignUp completes with the email code', async ({ host, screen }) => {
  const email = await host.newEmail();
  await host.launch();
  await host.tap(homeLinks(screen).customSignUp);
  await host.fill(screen.getByTestId('verify.customSignUp.emailAddress'), email);
  await host.fill(screen.getByTestId('verify.customSignUp.password'), `Verify-${host.runId}-Pw1!`);
  await host.tap(screen.getByTestId('verify.customSignUp.sendCode'));
  await expect(screen.getByTestId('verify.customSignUp.code')).toBeVisible({ timeout: 20_000 });
  await expect(screen.getByTestId('verify.customSignUp.error')).toHaveCount(0);
  await host.screenshot('custom-signup-code');
  await host.fill(screen.getByTestId('verify.customSignUp.code'), CLERK_TEST_CODE);
  await host.tap(screen.getByTestId('verify.customSignUp.verifyCode'));
  await host.expectSignedInAs(email, 30_000);
  await host.screenshot('custom-signed-up');
});
