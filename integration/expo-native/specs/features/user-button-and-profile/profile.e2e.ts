import { test, expect } from '../../fixtures.ts';
import { nativeProfile, nativeUserButton } from '../../native.ts';

test('the home UserButton opens the profile of the signed-in user', async ({ host, screen, platform }) => {
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await host.tap(nativeUserButton(screen, platform));
  const profile = nativeProfile(screen);
  await expect(profile.manageAccount).toBeVisible({ timeout: 20_000 });
  await host.screenshot('user-button-profile');
  await host.tap(profile.manageAccount);
  await expect(screen.getByText(user.email)).toBeVisible({ timeout: 20_000 });
  await host.screenshot('profile');
});

test('the home sign-out button ends the session', async ({ host }) => {
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await host.tap(host.app.signOut);
  await host.expectSignedOut();
  await expect(host.app.signIn).toBeVisible();
  await host.screenshot('signed-out');
});
