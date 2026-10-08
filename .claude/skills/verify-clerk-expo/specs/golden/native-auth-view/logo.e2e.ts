import { test, expect } from '../../fixtures.ts';
import { closeNativeAuth, homeLinks, nativeAuth, signInWithPassword } from '../../native.ts';

test('signs in with a password through the AuthView that has a logo, after it closed and reopened', async ({
  host,
  screen,
  device,
  platform,
}) => {
  const logo = screen.getByText('E2E Custom Logo');
  const signInWithLogo = homeLinks(screen).authLogo;
  const user = await host.seedUser({ password: true });
  await host.launch();
  await host.tap(signInWithLogo);
  await expect(logo).toBeVisible({ timeout: 20_000 });
  await expect(nativeAuth(screen, platform).identifier).toBeVisible();
  await host.screenshot('logo');
  await closeNativeAuth(screen, device, platform);
  await host.expectSignedOut(15_000);
  await expect(logo).toHaveCount(0);

  await host.tap(signInWithLogo);
  await expect(logo).toBeVisible({ timeout: 20_000 });
  await host.screenshot('logo-reopened');
  await signInWithPassword(host, screen, platform, user);
  await host.expectSignedInAs(user, 45_000);
  await host.screenshot('signed-in-with-logo');
});
