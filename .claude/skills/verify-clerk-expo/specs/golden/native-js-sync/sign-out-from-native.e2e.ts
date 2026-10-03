import { test, expect } from '../../fixtures.ts';
import { nativeProfile } from '../../native.ts';

test('signing out in the native UserProfileView signs out the JS hooks', async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  const state = await host.launch({ signedInAs: user, screen: 'userProfile' });
  expect(state.userId).toBe(user.id);
  const profile = nativeProfile(screen);
  await expect(profile.signOut).toBeVisible({ timeout: 30_000 });
  await host.screenshot('before-sign-out');
  await host.tap(profile.signOut);
  const signedOut = await host.waitForState((s) => !s.signedIn, 20_000);
  expect(signedOut.userId).toBeNull();
  expect(signedOut.sessionId).toBeNull();
  await host.screenshot('signed-out');
});
