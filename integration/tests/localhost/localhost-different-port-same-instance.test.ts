/**
 * This test is the development version of the test described in root-sub-same-instance-prod.test.ts
 * Refer to that file for extra details.
 *
 * localhost:3000 <> clerk-instance-1
 * localhost:3001 <> clerk-instance-1
 *
 */

import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { prepareApplication } from '../sessions/utils';

test.describe('multiple apps running on localhost using same Clerk instance @localhost', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUsers: FakeUser[];
  let apps: Array<{ app: Application; serverUrl: string }>;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for apps to be ready
    apps = await Promise.all([prepareApplication('sessions-dev-1'), prepareApplication('sessions-dev-1')]);

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

  test('the cookies are aligned for the root and sub domains', async ({ context }) => {
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

    await u[1].page.goToAppHome();
    await u[1].po.expect.toBeSignedIn();

    // We should have the same number of cookies here as this is the same instance running
    tab0Cookies = (await u[0].page.cookies()).raw();
    expect(tab0Cookies.filter(c => c.name.startsWith('__session'))).toHaveLength(2);
    expect(tab0Cookies.filter(c => c.name.startsWith('__clerk_db_jwt'))).toHaveLength(2);
    expect(tab0Cookies.filter(c => c.name.startsWith('__client_uat'))).toHaveLength(2);

    const tab1User = await u[1].po.clerk.getClientSideUser();
    expect(tab0User.id).toEqual(tab1User.id);
    // make sure that the backend user now matches the user we signed in with on the client
    expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab1User.id);

    // Reload tab 0 and make sure that the original user is still signed in
    // This tests that signing-in from the second tab did not interfere with the original session
    await u[0].page.reload();
    await u[0].po.expect.toBeSignedIn();
    expect(tab0User.id).toBe((await u[0].po.clerk.getClientSideUser()).id);
  });

  test('signing out from the root domain affects the sub domain', async ({ context }) => {
    const pages = await Promise.all([context.newPage(), context.newPage()]);
    const u = [
      createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
      createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
    ];

    // sign tab0
    await u[0].po.signIn.goTo();
    await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
    await u[0].po.expect.toBeSignedIn();

    // sign out from tab1
    await u[1].page.goToAppHome();
    // This also ensures Clerk has loaded before evaluating the signOut
    await u[1].po.expect.toBeSignedIn();
    await u[1].page.evaluate(() => window.Clerk.signOut());
    await u[1].po.expect.toBeSignedOut();

    await u[0].page.reload();
    await u[0].po.expect.toBeSignedOut();
  });
});
