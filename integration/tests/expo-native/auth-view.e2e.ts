import { expect } from 'e2e';

import { testWithUser as test } from './fixtures.ts';

test.describe('AuthView', () => {
  test.beforeEach(({ po }) => po.app.reset());

  test('native sign-in syncs to JS and survives a restart', async ({ app, po, user }) => {
    await po.authView.open();
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await app.restart();
    await po.app.expectSignedIn();
    await po.app.signOut();
  });

  test('survives detach and reattach', async ({ po, screen, user }) => {
    await po.authView.open();
    await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 10_000 });
    await po.authView.dismiss();
    await po.authView.open();
    await expect(screen.getByText('E2E Custom Logo')).toBeVisible({ timeout: 15_000 });
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await po.app.signOut();
  });
});
