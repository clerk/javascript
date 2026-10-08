import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';

test('signs in through AuthView with the email code', { platforms: ['ios'] }, async ({ host, screen }) => {
  const user = await host.seedUser();
  await host.launch({ authMode: 'signIn' });
  await host.tap(host.app.signInFullScreen);
  await host.fill(screen.getByTestId('clerk.auth.start.identifier'), user.email);
  await host.tap(screen.getByTestId('clerk.auth.start.continue'));
  const anotherMethod = screen.getByText('Use another method');
  await expect(anotherMethod).toBeVisible({ timeout: 20_000 });
  await host.tap(anotherMethod);
  await host.tap(screen.getByTestId('clerk.auth.signIn.alternativeMethod.email_code'));
  await expect(screen.getByTestId('clerk.auth.signIn.code')).toBeVisible({ timeout: 20_000 });
  await expect(screen.getByText(user.email)).toBeVisible();
  await host.screenshot('code-screen');
  await host.fill(screen.getByTestId('clerk.auth.signIn.code'), CLERK_TEST_CODE);
  await host.expectSignedInAs(user, 30_000);
  await host.screenshot('signed-in');
});
