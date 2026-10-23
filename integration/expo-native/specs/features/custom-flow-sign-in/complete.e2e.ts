import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

test('useSignIn completes with the email code', async ({ host, screen }) => {
  const user = await host.seedUser();
  await host.launch();
  await host.tap(homeLinks(screen).customSignIn);
  await host.fill(screen.getByTestId('verify.customSignIn.emailAddress'), user.email);
  await host.tap(screen.getByTestId('verify.customSignIn.sendCode'));
  await expect(screen.getByTestId('verify.customSignIn.code')).toBeVisible({ timeout: 20_000 });
  await expect(screen.getByTestId('verify.customSignIn.error')).toHaveCount(0);
  await host.screenshot('custom-code');
  await host.fill(screen.getByTestId('verify.customSignIn.code'), CLERK_TEST_CODE);
  await host.tap(screen.getByTestId('verify.customSignIn.verifyCode'));
  await host.expectSignedInAs(user, 30_000);
  await host.screenshot('custom-signed-in');
});
