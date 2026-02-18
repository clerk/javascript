/**
 * This test verifies that users can develop run multiple Clerk apps at the same time locally
 * while using localhost and different ports. Most frameworks will try to listen to their default ports,
 * but if the port is taken, they will try to use a free port. Also, by default, most frameworks use
 * `localhost` (or a local IP pointing to 127.0.0.1).
 *
 * localhost:3000 <> clerk-instance-1
 * localhost:3001 <> clerk-instance-2
 *
 */

import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { prepareApplication } from '../sessions/utils';

test.describe('multiple apps running on localhost using different Clerk instances @localhost', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUsers: FakeUser[];
  let apps: Array<{ app: Application; serverUrl: string }>;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for apps to be ready
    apps = await Promise.all([prepareApplication('sessions-dev-1'), prepareApplication('sessions-dev-2')]);

    const u = apps.map(a => createTestUtils({ app: a.app }));
    fakeUsers = await Promise.all(u.map(u => u.services.users.createFakeUser()));
    await Promise.all([
      await u[0].services.users.createBapiUser(fakeUsers[0]),
      await u[1].services.users.createBapiUser(fakeUsers[1]),
    ]);
  });

  test.afterAll(async () => {
    await Promise.all(fakeUsers.map(u => u.deleteIfExists()));
    await Promise.all(apps.map(({ app }) => app.teardown()));
  });

  test('sessions are independent between the different apps', async ({ context }) => {
    const pages = await Promise.all([context.newPage(), context.newPage()]);
    const u = [
      createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
      createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
    ];

    await u[0].po.signIn.goTo();
    await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
    await u[0].po.expect.toBeSignedIn();
    const tab0User = await u[0].po.clerk.getClientSideUser();

    // make sure that the backend user now matches the user we signed in with on the client
    expect((await u[0].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab0User.id);

    // Check that the cookies are set as expected
    let tab0Cookies = (await u[0].page.cookies()).raw();
    // 1 base cookie, 1 suffixed
    expect(tab0Cookies.filter(c => c.name.startsWith('__session'))).toHaveLength(2);
    expect(tab0Cookies.filter(c => c.name.startsWith('__clerk_db_jwt'))).toHaveLength(2);
    expect(tab0Cookies.filter(c => c.name.startsWith('__client_uat'))).toHaveLength(2);

    await u[1].po.signIn.goTo();
    await u[1].po.expect.toBeSignedOut();
    await u[1].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[1]);
    await u[1].po.expect.toBeSignedIn();

    const tab1User = await u[1].po.clerk.getClientSideUser();
    expect(tab0User.id).not.toEqual(tab1User.id);
    // make sure that the backend user now matches the user we signed in with on the client
    expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab1User.id);

    // Get the cookies again, now we have the cookies from the new tab as well
    tab0Cookies = (await u[0].page.cookies()).raw();
    expect(tab0Cookies.filter(c => c.name.startsWith('__session'))).toHaveLength(3);
    expect(tab0Cookies.filter(c => c.name.startsWith('__clerk_db_jwt'))).toHaveLength(3);
    expect(tab0Cookies.filter(c => c.name.startsWith('__client_uat'))).toHaveLength(3);

    // Reload tab 0 and make sure that the original user is still signed in
    // This tests that signing-in from the second tab did not interfere with the original session
    await u[0].page.reload();
    await u[0].po.expect.toBeSignedIn();
    expect(tab0User.id).toBe((await u[0].po.clerk.getClientSideUser()).id);
  });

  test('signing out from the root domains does not affect the sub domain', async ({ context }) => {
    const pages = await Promise.all([context.newPage(), context.newPage()]);
    const u = [
      createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
      createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
    ];

    // signin in tab0
    await u[0].po.signIn.goTo();
    await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
    await u[0].po.expect.toBeSignedIn();

    // signin in tab1
    await u[1].po.signIn.goTo();
    await u[1].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[1]);
    await u[1].po.expect.toBeSignedIn();

    // singout from tab0
    await u[0].page.evaluate(() => window.Clerk.signOut());
    await u[0].po.expect.toBeSignedOut();

    // ensure we're still logged in in tab1
    await u[1].page.reload();
    await u[1].po.expect.toBeSignedIn();
  });
});
