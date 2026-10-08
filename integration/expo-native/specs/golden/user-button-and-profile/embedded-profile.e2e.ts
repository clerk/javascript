import { test, expect } from '../../fixtures.ts';
import { embeddedProfile, homeLinks, leaveCustomPage, nativeProfile, tapProfileBack } from '../../native.ts';

test('onHostBack closes the embedded profile after native navigation', async ({ host, screen }) => {
  const user = await host.seedUser();
  const profile = nativeProfile(screen);
  const embedded = embeddedProfile(screen);
  await host.launch({ signedInAs: user });
  await host.tap(homeLinks(screen).embeddedProfile);
  await expect(profile.manageAccount).toBeVisible({ timeout: 20_000 });
  await host.screenshot('embedded-profile');

  await host.tap(profile.manageAccount);
  await expect(screen.getByText(user.email)).toBeVisible({ timeout: 20_000 });
  await tapProfileBack(screen);
  await expect(embedded.customPageRow).toBeVisible({ timeout: 15_000 });

  await tapProfileBack(screen);
  await host.expectSignedInAs(user, 15_000);
  await expect(embedded.customPageRow).toHaveCount(0);
  await host.screenshot('closed-home');
});

test('a custom page renders React Native content inside the embedded profile', async ({
  host,
  screen,
  device,
  platform,
}) => {
  const user = await host.seedUser();
  const profile = nativeProfile(screen);
  const embedded = embeddedProfile(screen);
  await host.launch({ signedInAs: user });
  await host.tap(homeLinks(screen).embeddedProfile);
  await host.tap(embedded.customPageRow);
  await expect(embedded.customPageBody).toBeVisible({ timeout: 15_000 });

  await leaveCustomPage(screen, device, platform);
  await expect(profile.manageAccount).toBeVisible({ timeout: 15_000 });
  await expect(embedded.customPageBody).toHaveCount(0);

  await tapProfileBack(screen);
  await host.expectSignedInAs(user, 15_000);
  await expect(profile.manageAccount).toHaveCount(0);
});
