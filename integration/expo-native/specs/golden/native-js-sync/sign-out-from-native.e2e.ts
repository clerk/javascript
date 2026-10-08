import { test, expect } from '../../fixtures.ts';
import { nativeProfile, nativeUserButton } from '../../native.ts';

test('signing out in the native profile signs out the JS hooks', async ({ host, screen, platform }) => {
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await host.tap(nativeUserButton(screen, platform));
  const profile = nativeProfile(screen);
  await expect(profile.signOut).toBeVisible({ timeout: 30_000 });
  await host.screenshot('before-sign-out');
  await host.tap(profile.signOut);
  await host.expectSignedOut(20_000);
  await host.screenshot('signed-out');
});
