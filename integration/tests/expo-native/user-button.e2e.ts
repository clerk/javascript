import { testWithUser as test } from './fixtures.ts';

test.describe('UserButton', () => {
  test.beforeEach(({ po }) => po.app.reset());

  test('native sign-out, then same-process re-sign-in', async ({ po, user }) => {
    await po.authView.open();
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await po.userButton.open();
    await po.userButton.signOut();
    await po.app.expectSignedOut();
    await po.authView.open();
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await po.app.signOut();
  });
});
