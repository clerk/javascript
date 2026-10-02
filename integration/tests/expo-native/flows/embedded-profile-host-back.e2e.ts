import { expect } from 'e2e';

import { test } from './fixtures.ts';
import {
  assertSignedIn,
  assertSignedOut,
  openApp,
  openAuthView,
  signInEmailPassword,
  tapBack,
  tapControl,
  tapUntilVisible,
} from './subflows.ts';

const internalPush = {
  android: { root: 'Edit profile', row: 'Manage account', detail: /^(EMAIL ADDRESSES|Add email address)$/ },
  ios: { root: 'Security', row: 'Security', detail: /^(Password|Passkeys|Two-step verification|Active devices)$/i },
};

test('Embedded UserProfileView host back round trip', async fixtures => {
  const { platform, screen } = fixtures;
  const { root, row, detail } = internalPush[platform as keyof typeof internalPush];
  await openApp(fixtures);
  await openAuthView(fixtures);
  await signInEmailPassword(fixtures);
  await assertSignedIn(fixtures);
  await tapUntilVisible(screen.getByTestId('open-embedded-profile-button'), screen.getByText(root));
  await tapControl(fixtures, screen.getByText(row));
  await expect(screen.getByText(detail).first()).toBeVisible({ timeout: 15_000 });
  await tapBack(fixtures);
  await expect(screen.getByText(root)).toBeVisible({ timeout: 15_000 });
  await tapBack(fixtures);
  await expect(screen.getByTestId('open-embedded-profile-button')).toBeVisible({ timeout: 15_000 });
  await screen.getByTestId('sign-out-button').tap();
  await assertSignedOut(fixtures);
});
