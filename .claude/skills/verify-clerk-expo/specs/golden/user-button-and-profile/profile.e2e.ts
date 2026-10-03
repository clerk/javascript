import { test, expect } from '../../fixtures.ts';
import { nativeProfile, nativeUserButton } from '../../native.ts';

test('the native UserProfileView shows the seeded user', async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  const state = await host.launch({ signedInAs: user, screen: 'userProfile' });
  expect(state.userId).toBe(user.id);
  expect(state.sessionStatus).toBe('active');
  const profile = nativeProfile(screen);
  await expect(profile.manageAccount).toBeVisible({ timeout: 30_000 });
  await host.tap(profile.manageAccount);
  await expect(screen.getByText(user.email)).toBeVisible({ timeout: 20_000 });
  await host.screenshot('profile');
});

test('the native UserButton opens the profile', async ({ host, screen, platform }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  const state = await host.launch({ signedInAs: user, screen: 'userButton' });
  expect(state.userId).toBe(user.id);
  const button = nativeUserButton(screen, platform);
  await expect(button).toBeVisible({ timeout: 30_000 });
  await host.tap(button);
  await expect(nativeProfile(screen).manageAccount).toBeVisible({ timeout: 20_000 });
  await host.screenshot('user-button-profile');
});
