import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { assertSignedIn, assertSignedOut, openApp, signInEmailPassword } from './subflows.ts';

test('Native AuthView sign-in syncs to JS and survives a restart', async fixtures => {
  const { app, screen } = fixtures;
  await openApp(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await app.restart();
  await expect(screen.getByText('signed in')).toBeVisible({ timeout: 45_000 });
  await expect(screen.getByTestId('user-id')).toBeVisible();
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
