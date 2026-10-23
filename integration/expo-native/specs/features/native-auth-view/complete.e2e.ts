import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';
import { nativeAuth } from '../../native.ts';

test('signs in through AuthView with the email code', async ({ host, screen, platform }) => {
  const user = await host.seedUser();
  await host.launch({ authMode: 'signIn' });
  await host.tap(host.app.signInFullScreen);
  const auth = nativeAuth(screen, platform);
  await host.fill(auth.identifier, user.email);
  await host.tap(auth.continue);
  await expect(auth.codeScreen).toBeVisible({ timeout: 20_000 });
  await expect(screen.getByText(user.email).first()).toBeVisible();
  await host.screenshot('code-screen');
  await host.fill(auth.codeField, CLERK_TEST_CODE);
  await host.expectSignedInAs(user, 30_000);
  await host.screenshot('signed-in');
});
