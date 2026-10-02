import { expect } from 'e2e';

import { test } from './fixtures.ts';
import {
  assertSignedIn,
  assertSignedOut,
  openApp,
  openAuthView,
  signInEmailPassword,
  tapUntilVisible,
} from './subflows.ts';

test('AuthView survives detach and reattach', async fixtures => {
  const { device, platform, screen } = fixtures;
  await openApp(fixtures);
  await openAuthView(fixtures);
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 10_000 });
  const openButton = screen.getByTestId('open-auth-view-button');
  if (platform === 'android') {
    await device.back();
    await expect(openButton).toBeVisible({ timeout: 15_000 });
  } else {
    await tapUntilVisible(screen.getByRole('button', 'Close'), openButton);
  }
  await openAuthView(fixtures);
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 15_000 });
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
