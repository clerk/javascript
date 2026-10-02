import { expect } from 'e2e';

import { testWithUser as test } from './fixtures.ts';

test('AuthView survives detach and reattach', async ({ po, screen, user }) => {
  await po.app.reset();
  await po.authView.open();
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 10_000 });
  await po.authView.dismiss();
  await po.authView.open();
  await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 15_000 });
  await po.authView.signIn(user);
  await po.app.expectSignedIn();
  await po.app.signOut();
});
