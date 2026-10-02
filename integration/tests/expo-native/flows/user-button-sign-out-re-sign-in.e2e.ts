import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { assertSignedIn, assertSignedOut, openApp, signInEmailPassword } from './subflows.ts';

test('UserButton native sign-out, then same-process re-sign-in', async fixtures => {
  const { screen } = fixtures;
  await openApp(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByLabel(/^Open (account|user profile)$/).tap();
  await expect(screen.getByText('Manage account')).toBeVisible({ timeout: 15_000 });
  await screen.getByText('Sign out').tap();
  await assertSignedOut(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
