import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { assertSignedIn, assertSignedOut, openApp, signInEmailPassword, tapBack, tapControl } from './subflows.ts';

test('UserProfileView renders a custom page', async fixtures => {
  const { device, platform, screen } = fixtures;
  await openApp(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('open-embedded-profile-button').tap();
  await expect(screen.getByText('E2E Custom Page')).toBeVisible({ timeout: 20_000 });
  await tapControl(fixtures, screen.getByText('E2E Custom Page'));
  await expect(screen.getByText('Rehosted RN body')).toBeVisible({ timeout: 15_000 });
  if (platform === 'android') {
    await device.back();
  } else {
    await tapBack(fixtures);
  }
  await expect(screen.getByText('E2E Custom Page')).toBeVisible({ timeout: 15_000 });
  await tapBack(fixtures);
  await expect(screen.getByTestId('open-embedded-profile-button')).toBeVisible({ timeout: 15_000 });
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
