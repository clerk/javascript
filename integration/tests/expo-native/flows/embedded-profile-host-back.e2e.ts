import { test } from '@e2e-dev/mobile';
import { expect } from 'e2e';

import { assertSignedIn, assertSignedOut, openApp, signInEmailPassword, tapBack } from './subflows.ts';

const internalPush = {
  android: { root: 'Edit profile', row: 'Manage account', detail: /^(EMAIL ADDRESSES|Add email address)$/ },
  ios: { root: 'Security', row: 'Security', detail: /^(Password|Passkeys|Two-step verification|Active devices)$/i },
};

test('Embedded UserProfileView host back round trip', async fixtures => {
  const { platform, screen } = fixtures;
  const { root, row, detail } = internalPush[platform as keyof typeof internalPush];
  await openApp(fixtures);
  await screen.getByTestId('open-auth-view-button').tap();
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await screen.getByTestId('open-embedded-profile-button').tap();
  await expect(screen.getByText(root)).toBeVisible({ timeout: 20_000 });
  await screen.getByText(row).tap();
  await expect(screen.getByText(detail).first()).toBeVisible({ timeout: 15_000 });
  await tapBack(fixtures);
  await expect(screen.getByText(root)).toBeVisible({ timeout: 15_000 });
  await tapBack(fixtures);
  await expect(screen.getByTestId('open-embedded-profile-button')).toBeVisible({ timeout: 15_000 });
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
