import { testWithUser as test } from './fixtures.ts';

test('Native AuthView sign-in syncs to JS and survives a restart', async ({ app, po, user }) => {
  await po.app.reset();
  await po.authView.open();
  await po.authView.signIn(user);
  await po.app.expectSignedIn();
  await app.restart();
  await po.app.expectSignedIn();
  await po.app.signOut();
});
