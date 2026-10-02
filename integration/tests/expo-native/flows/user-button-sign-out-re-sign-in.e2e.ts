import { expect } from 'e2e';

import { test } from './fixtures.ts';
import { assertSignedIn, assertSignedOut, openApp, openAuthView, signInEmailPassword, tapControl } from './subflows.ts';

test('UserButton native sign-out, then same-process re-sign-in', async fixtures => {
  const { screen } = fixtures;
  await openApp(fixtures);
  await openAuthView(fixtures);
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByLabel(/^Open (account|user profile)$/).tap();
  await expect(screen.getByText('Manage account')).toBeVisible({ timeout: 15_000 });
  await tapControl(fixtures, screen.getByText('Sign out'));
  await assertSignedOut(fixtures);
  await openAuthView(fixtures);
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
