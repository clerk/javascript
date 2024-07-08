/**
 * This tests the scenario where a user is running an app on localhost:3000 and after stopping it, they start another
 * app on the same port with a different instance key. This is a common scenario for agencies using Clerk, developing multiple *unrelated* applications
 * one after the other.
 *
 * localhost:3000 <> clerk-instance-1
 * localhost:3000 <> clerk-instance-2
 *
 */

import { expect, test } from '@playwright/test';

import { getPort } from '../../scripts';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { prepareApplication } from './utils';

test.describe('switching instances on localhost same port @sessions', () => {
  test.describe.configure({ mode: 'serial' });
  const fakeUsers: FakeUser[] = [];

  test.afterAll(async () => {
    await Promise.all(fakeUsers.map(u => u.deleteIfExists()));
  });

  test('apps can be used without clearing the cookies after instance switch', async ({ context }) => {
    // We need both apps to run on the same port
    const port = await getPort();
    // Create app and user for the 1st app
    let app = await prepareApplication('sessions-dev-1', port);
    let page = await context.newPage();
    let u = createTestUtils({ app: app.app, page: page, context });
    let fakeUser = u.services.users.createFakeUser();
    fakeUsers.push(fakeUser);
    await u.services.users.createBapiUser(fakeUser);

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
    await u.po.expect.toBeSignedIn();
    expect((await u.po.clerk.getClientSideUser()).primaryEmailAddress.emailAddress).toBe(fakeUser.email);
    await app.app.teardown();

    // Create app and user for the 2nd app with a different instance key
    app = await prepareApplication('sessions-dev-2', port);
    page = await context.newPage();
    u = createTestUtils({ app: app.app, page: page, context });
    fakeUser = u.services.users.createFakeUser();
    fakeUsers.push(fakeUser);
    await u.services.users.createBapiUser(fakeUser);
    await u.page.pause();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
    await u.po.expect.toBeSignedIn();
    expect((await u.po.clerk.getClientSideUser()).primaryEmailAddress.emailAddress).toBe(fakeUser.email);
    await app.app.teardown();
  });
});
