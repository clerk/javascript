import { expect } from 'e2e';

import { testWithUser as test } from './fixtures.ts';

const internalPush = {
  android: { root: 'Edit profile', row: 'Manage account', detail: /^(EMAIL ADDRESSES|Add email address)$/ },
  ios: { root: 'Security', row: 'Security', detail: /^(Password|Passkeys|Two-step verification|Active devices)$/i },
};

test('Embedded UserProfileView host back round trip', async ({ platform, po, screen, user }) => {
  const { root, row, detail } = internalPush[platform as keyof typeof internalPush];
  await po.app.reset();
  await po.authView.open();
  await po.authView.signIn(user);
  await po.app.expectSignedIn();
  await po.userProfile.open();
  await expect(screen.getByText(root)).toBeVisible({ timeout: 20_000 });
  await po.userProfile.openRow(row);
  await expect(screen.getByText(detail).first()).toBeVisible({ timeout: 15_000 });
  await po.userProfile.back();
  await expect(screen.getByText(root)).toBeVisible({ timeout: 15_000 });
  await po.userProfile.back();
  await po.userProfile.expectClosed();
  await po.app.signOut();
});
