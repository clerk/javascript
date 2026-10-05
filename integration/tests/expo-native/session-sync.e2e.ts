import { testWithUser as test } from './fixtures.ts';

test.describe('@clerk/expo native session sync', () => {
  test.beforeEach(({ po }) => po.app.reset());

  test('a native sign-in reaches the JS SDK and survives an app restart', async ({ app, po, user }) => {
    await po.authView.open();
    await po.authView.signIn(user);
    await po.app.expectSignedIn();
    await app.restart();
    await po.app.expectSignedIn();
    await po.app.signOut();
  });

  test('a native sign-out reaches the JS SDK, and so does a second sign-in in the same process', async ({
    po,
    user,
  }) => {
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
