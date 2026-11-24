import { test, expect } from '../../fixtures.ts';
import { signInWithPassword } from '../../native.ts';

test('signing in as another user works after a sign-out that never reached Clerk', async ({
  host,
  screen,
  platform,
}) => {
  await host.useSettings({
    config: { 'session_settings.multi_session_enabled': false },
    environment: { 'auth_config.single_session_mode': true },
  });
  const first = await host.seedUser();
  const second = await host.seedUser({ password: true });
  await host.launch({ signedInAs: first });
  await host.tap(screen.getByTestId('verify.fault.dropSignOut'));
  await host.evidence('sign out offline, then sign in as another user', async () => {
    await host.tap(host.app.signOut);
    await host.expectSignedOut(20_000);
    await expect(screen.getByTestId('verify.fault.droppedSignOuts')).toHaveText('1');
    await host.tap(host.app.signIn);
    await signInWithPassword(host, screen, platform, second);
    await host.expectSignedInAs(second, 45_000);
  });
  await host.screenshot('signed-in-as-second-user');
});
