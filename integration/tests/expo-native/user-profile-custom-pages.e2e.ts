import { expect } from 'e2e';

import { testWithUser as test } from './fixtures.ts';

test('UserProfileView renders a custom page', async ({ po, screen, user }) => {
  await po.app.reset();
  await po.authView.open();
  await po.authView.signIn(user);
  await po.app.expectSignedIn();
  await po.userProfile.open();
  await po.userProfile.openRow('E2E Custom Page');
  await expect(screen.getByText('Rehosted RN body')).toBeVisible({ timeout: 15_000 });
  await po.userProfile.leaveCustomPage();
  await expect(screen.getByText('E2E Custom Page')).toBeVisible({ timeout: 15_000 });
  await po.userProfile.back();
  await po.userProfile.expectClosed();
  await po.app.signOut();
});
