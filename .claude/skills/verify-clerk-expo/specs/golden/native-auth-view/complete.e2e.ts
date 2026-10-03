import { test, expect, CLERK_TEST_CODE } from '../../fixtures.ts';

test('signs in through AuthView with the email code', { tags: ['form-entry'], platforms: ['ios'] }, async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  await host.launch({ instance: 'with-email-codes', screen: 'auth', authMode: 'signIn' });
  await expect(screen.getByTestId('clerk.auth.start.identifier')).toBeVisible({ timeout: 30_000 });
  await host.fill(screen.getByTestId('clerk.auth.start.identifier'), user.email);
  await host.tap(screen.getByTestId('clerk.auth.start.continue'));
  await host.waitForState((s) => s.signInStatus === 'needs_first_factor', 20_000);
  await host.tap(screen.getByText('Use another method'));
  await host.tap(screen.getByTestId('clerk.auth.signIn.alternativeMethod.email_code'));
  await expect(screen.getByTestId('clerk.auth.signIn.code')).toBeVisible({ timeout: 20_000 });
  await host.screenshot('code-screen');
  await host.fill(screen.getByTestId('clerk.auth.signIn.code'), CLERK_TEST_CODE);
  const state = await host.waitForState((s) => s.signedIn && s.sessionStatus === 'active', 30_000);
  expect(state.userId).toBe(user.id);
  await host.screenshot('signed-in');
});
