import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { assertSignedIn, assertSignedOut, openApp, signInEmailPassword } from './subflows.ts';

test('AuthView survives detach and reattach', async fixtures => {
  const { device, platform, screen } = fixtures;
  await openApp(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await expect(screen.getByText(/^Welcome! Sign in to continue\.?$/)).toBeVisible({ timeout: 25_000 });
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 10_000 });
  if (platform === 'android') {
    await device.back();
  } else {
    await screen.getByRole('button', 'Close').tap();
  }
  await expect(screen.getByTestId('open-auth-view-button')).toBeVisible({ timeout: 15_000 });
  await screen.getByTestId('open-auth-view-button').tap();
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 15_000 });
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
