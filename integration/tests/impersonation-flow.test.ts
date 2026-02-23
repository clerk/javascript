import type { User } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Impersonation Flow @generic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let user1: FakeUser;
  let user2: FakeUser;
  let user1Created: User;
  let user2Created: User;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });

    user1 = u.services.users.createFakeUser();
    user2 = u.services.users.createFakeUser();

    user1Created = await u.services.users.createBapiUser(user1);
    user2Created = await u.services.users.createBapiUser(user2);
  });

  test.afterAll(async () => {
    await user1.deleteIfExists();
    await user2.deleteIfExists();
    await app.teardown();
  });

  test('should handle user impersonation flow correctly', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // User 1 logs in
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: user1.email,
      password: user1.password,
    });
    await u.po.expect.toBeSignedIn();

    // Assert User 1 is the active session & not impersonating
    const assertion1User = await u.po.clerk.getClientSideUser();
    const assertion1Actor = await u.po.clerk.getClientSideActor();
    expect(assertion1User.id).toBe(user1Created.id);
    expect(assertion1Actor).toBeNull();

    // User 1 impersonates User 2
    const actorTokenResponse = await u.services.clerk.actorTokens.create({
      userId: user1Created.id,
      expiresInSeconds: 120,
      actor: {
        sub: user2Created.id,
      },
    });

    // Pass through the ticket flow
    const searchParams = new URLSearchParams();
    searchParams.set('__clerk_ticket', actorTokenResponse.token);
    // We don't use u.signIn.goTo here since the navigation can happen so quickly
    // that Playwright can miss catching the sign in component having been mounted
    await u.page.goToRelative('/sign-in', { searchParams });

    // Ensure that the impersonation flow is successful
    await u.po.expect.toBeSignedInAsActor();

    // Assert User 2 is now the active session
    const assertion2User = await u.po.clerk.getClientSideUser();
    const assertion2Actor = await u.po.clerk.getClientSideActor();
    expect(assertion2User.id).toBe(user1Created.id);
    expect(assertion2Actor.sub).toBe(user2Created.id);

    await u.po.impersonation.waitForMounted();
    await u.po.impersonation.getSignOutLink().click();
    await u.po.expect.toBeSignedOut();
  });
});
