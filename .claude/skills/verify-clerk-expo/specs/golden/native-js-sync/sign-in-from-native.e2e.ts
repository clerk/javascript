import { test, expect } from '../../fixtures.ts';
import { nativeProfile, nativeUserButton, signInWithPassword } from '../../native.ts';

test('a native password sign-in reaches the JS hooks and survives a relaunch', async ({ host, screen, platform }) => {
  const user = await host.seedUser({ password: true });
  await host.launch();
  await host.tap(host.app.signIn);
  await signInWithPassword(host, screen, platform, user);
  await host.expectSignedInAs(user, 45_000);
  const session = (await host.app.sessionId.textContent()) ?? '';
  await host.screenshot('signed-in');

  await host.launch({ keepStorage: true, landsOn: host.app.signedIn });
  await host.expectSignedInAs(user);
  await expect(host.app.sessionId).toHaveText(session);
  await host.screenshot('restored-home');
});

test('a second native sign-in in the same process reaches the JS hooks', async ({ host, screen, platform }) => {
  const user = await host.seedUser({ password: true });
  await host.launch();
  await host.tap(host.app.signIn);
  await signInWithPassword(host, screen, platform, user);
  await host.expectSignedInAs(user, 45_000);

  await host.tap(nativeUserButton(screen, platform));
  const profile = nativeProfile(screen);
  await expect(profile.signOut).toBeVisible({ timeout: 30_000 });
  await host.tap(profile.signOut);
  await host.expectSignedOut(20_000);

  await host.tap(host.app.signIn);
  await signInWithPassword(host, screen, platform, user);
  await host.expectSignedInAs(user, 45_000);
  await host.screenshot('signed-in-again');
});
