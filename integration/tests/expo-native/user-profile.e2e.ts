import { expect } from 'e2e';

import { testWithUser as test } from './fixtures.ts';

const internalPush = {
  android: { root: 'Edit profile', row: 'Manage account', detail: /^(EMAIL ADDRESSES|Add email address)$/ },
  ios: { root: 'Security', row: 'Security', detail: /^(Password|Passkeys|Two-step verification|Active devices)$/i },
};

test.describe('UserProfileView', () => {
  test.beforeEach(async ({ po, user }) => {
    await po.app.reset();
    await po.authView.open();
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await po.userProfile.open();
  });

  test('embedded host back round trip', async ({ platform, po, screen }) => {
    const { root, row, detail } = internalPush[platform as keyof typeof internalPush];
    await expect(screen.getByText(root)).toBeVisible({ timeout: 20_000 });
    await po.userProfile.openRow(row);
    await expect(screen.getByText(detail).first()).toBeVisible({ timeout: 15_000 });
    await po.userProfile.back();
    await expect(screen.getByText(root)).toBeVisible({ timeout: 15_000 });
    await po.userProfile.back();
    await po.userProfile.expectClosed();
    await po.app.signOut();
  });

  test('renders a custom page', async ({ po, screen }) => {
    await po.userProfile.openRow('E2E Custom Page');
    await expect(screen.getByText('Rehosted RN body')).toBeVisible({ timeout: 15_000 });
    await po.userProfile.leaveCustomPage();
    await expect(screen.getByText('E2E Custom Page')).toBeVisible({ timeout: 15_000 });
    await po.userProfile.back();
    await po.userProfile.expectClosed();
    await po.app.signOut();
  });
});
