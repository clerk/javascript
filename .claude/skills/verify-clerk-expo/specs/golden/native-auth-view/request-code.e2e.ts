import { test, expect } from '../../fixtures.ts';

test(
  'an existing test user reaches the email code screen in AuthView',
  { platforms: ['ios'] },
  async ({ host, screen }) => {
    const user = await host.seedUser();
    await host.launch({ screen: 'auth', authMode: 'signIn' });
    await expect(screen.getByTestId('clerk.auth.start.identifier')).toBeVisible({ timeout: 30_000 });
    await host.fill(screen.getByTestId('clerk.auth.start.identifier'), user.email);
    await host.tap(screen.getByTestId('clerk.auth.start.continue'));
    await host.waitForState(s => s.signInStatus === 'needs_first_factor', 20_000);
    await host.tap(screen.getByText('Use another method'));
    await host.tap(screen.getByTestId('clerk.auth.signIn.alternativeMethod.email_code'));
    await expect(screen.getByTestId('clerk.auth.signIn.code')).toBeVisible({ timeout: 20_000 });
    const state = await host.state();
    expect(state.signedIn).toBe(false);
    expect(state.signInStatus).toBe('needs_first_factor');
    await host.screenshot('code-screen');
  },
);
