import type { Server, ServerOptions } from 'node:https';

import { expect, test } from '@playwright/test';

import { constants } from '../../constants';
import type { Application } from '../../models/application';
import { fs } from '../../scripts';
import { createProxyServer } from '../../scripts/proxyServer';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { prepareApplication } from './utils';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const APP_1_ENV_KEY = process.env.E2E_SESSIONS_APP_1_ENV_KEY;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const APP_1_HOST = process.env.E2E_SESSIONS_APP_1_HOST;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const APP_2_ENV_KEY = process.env.E2E_SESSIONS_APP_2_ENV_KEY;

/**
 * These two suites need to run in serial mode because they are both using a local proxy server
 * that listens to port 443. We can't run them in parallel because they would conflict with each other, unless
 * we use more custom domains to avoid collision.
 */
test.describe('root and subdomain production apps @sessions', () => {
  test.describe.configure({ mode: 'serial' });

  /**
   * This test verifies that the session is shared between different apps running on different subdomains
   * but using the same instance. This covers the use case where a customer wants multiple apps sharing the same userbase and session.
   * Our own setup with clerk.com and dashboard.clerk.com is the perfect example for such a use case.
   *
   * test.com <> clerk-instance-1
   * dashboard.test.com <> clerk-instance-1
   *
   * Requirements:
   * 1. This test assumes that the apps are deployed as production apps and expects that both
   *    are served using TLS. The local proxy server expects a `sessions.pem`/`sessions-key.pem` certificate/key pair to be available
   *    at the specified location (`integration/cert`). To learn how to generate a self-signed certificate,
   *    please refer to the README.md file in the `integration/cert` directory.
   *
   * The test will:
   * 1. Use a production instance created from clerkstage.dev
   * 2. Create two apps, both using the same instance key.
   * 3. Start a local server that proxies requests to the two apps based on the host
   * 4. The first app is going to be served on multiple-apps-e2e.clerk.app
   * 5. The second app is going to be served on sub-1.multiple-apps-e2e.clerk.app
   */
  test.describe('multiple apps same domain for the same production instances', () => {
    const hosts = [`${APP_1_HOST}:8443`, `sub-1.${APP_1_HOST}:8443`];

    let fakeUser: FakeUser;
    let server: Server;
    let apps: Array<{ app: Application; serverUrl: string }>;

    test.beforeAll(async () => {
      apps = await Promise.all([
        // first app
        prepareApplication(APP_1_ENV_KEY),
        // second app using the same instance keys
        prepareApplication(APP_1_ENV_KEY),
      ]);

      // TODO: Move this into createProxyServer
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };

      server = createProxyServer({
        ssl,
        targets: {
          [hosts[0]]: apps[0].serverUrl,
          [hosts[1]]: apps[1].serverUrl,
        },
      });

      const u = createTestUtils({ app: apps[0].app });
      fakeUser = u.services.users.createFakeUser();
      try {
        await u.services.users.createBapiUser(fakeUser);
      } catch (error) {
        console.error(error);
      }
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await Promise.all(apps.map(({ app }) => app.teardown()));
      server.close();
    });

    test('the cookies are aligned for the root and sub domains', async ({ context }) => {
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      const u = [
        createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
        createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
      ];

      await u[0].page.goto(`https://${hosts[0]}`);
      await u[0].po.signIn.goTo();
      await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u[0].po.expect.toBeSignedIn();
      const tab0User = await u[0].po.clerk.getClientSideUser();
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[0].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab0User.id);

      // Check that the cookies are set as expected
      const tab0Cookies = await u[0].page.cookies();
      expect(tab0Cookies.get('__session')).toBeDefined();
      expect(tab0Cookies.get('__session').domain).toEqual(hosts[0].split(':')[0]);
      expect(tab0Cookies.get('__session').value).toEqual(tab0Cookies.get('__session_*').value);
      expect(tab0Cookies.get('__session_*').name.split('__session_')[1].length).toEqual(8);

      expect(tab0Cookies.get('__client_uat')).toBeDefined();
      // The client_uat cookie should always be set on etld+1
      expect(tab0Cookies.get('__client_uat').domain).toEqual('.' + hosts[0].split(':')[0]);
      expect(tab0Cookies.get('__client_uat').value).toEqual(tab0Cookies.get('__client_uat_*').value);
      expect(tab0Cookies.get('__client_uat').domain).toEqual(tab0Cookies.get('__client_uat_*').domain);
      expect(tab0Cookies.get('__client_uat_*').name.split('__client_uat_')[1].length).toEqual(8);

      await u[1].page.goto(`https://${hosts[1]}`);
      // user should be signed in already
      await u[1].po.expect.toBeSignedIn();
      const tab1User = await u[1].po.clerk.getClientSideUser();

      // make sure we're signed in using the same user
      expect(tab0User.id).toEqual(tab1User.id);
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab1User.id);

      const tab1Cookies = await u[1].page.cookies();

      // both apps are using the same instance
      // so the client cookie should be set on the same clerk.* domain
      expect(tab0Cookies.get('__client').domain).toEqual(tab1Cookies.get('__client').domain);
      // the client_uat cookie should be set on the root domain for both
      // so, it can be shared between all subdomains
      // The client_uat cookie should always be set on etld+1
      expect(tab0Cookies.get('__client_uat_*').domain).toEqual(tab1Cookies.get('__client_uat_*').domain);
      // There should be 1 base client_uat cookie and 1 suffixed variants
      expect(tab0Cookies.raw().filter(c => c.name.startsWith('__client_uat')).length).toEqual(2);
      // the session cookie should be set on the domain of the app
      // so, it can be accessed by the host server
      expect(tab1Cookies.get('__session').domain).toEqual(hosts[1].split(':')[0]);
      expect(tab1Cookies.get('__session').domain).not.toEqual(tab0Cookies.get('__session').domain);
    });

    test('signing out from the sub domains signs out the user from the root domain as well', async ({ context }) => {
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      const u = [
        createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
        createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
      ];

      await u[0].page.goto(`https://${hosts[0]}`);
      await u[0].po.signIn.goTo();
      await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u[0].po.expect.toBeSignedIn();

      await u[1].page.goto(`https://${hosts[1]}`);
      await u[1].po.expect.toBeSignedIn();
      await u[1].page.evaluate(() => window.Clerk.signOut());
      await u[1].po.expect.toBeSignedOut();

      await u[0].page.reload();
      await u[0].po.expect.toBeSignedOut();
    });
  });

  /**
   * This test verifies that the session is not shared between different apps running on different subdomains, while
   * using different Clerk instances. This covers the use case where a customer wants their prod app to be hosted on
   * their root domain and possibly have a second Clerk instance that is a copy of their prod instance
   * and a staging environment hosted on a subdomain.
   *
   * test.com <> clerk-instance-1
   * stg.test.com <> clerk-instance-2
   *
   * Requirements:
   * 1. This test assumes that the apps are deployed as production apps and expects that both
   *    are served using TLS. The local proxy server expects a `sessions.pem`/`sessions-key.pem` certificate/key pair to be available
   *    at the specified location (`integration/cert`). To learn how to generate a self-signed certificate,
   *    please refer to the README.md file in the `integration/cert` directory.
   *
   * The test will:
   * 1. Use a production instance created from clerkstage.dev
   * 2. Create two apps, each using its own instance key.
   * 3. Start a local server that proxies requests to the two apps based on the host
   * 4. The first app is going to be served on multiple-apps-e2e.clerk.app
   * 5. The second app is going to be served on sub-1.multiple-apps-e2e.clerk.app
   */
  test.describe('multiple apps same domain for different production instances', () => {
    const hosts = [`${APP_1_HOST}:8443`, `sub-2.${APP_1_HOST}:8443`];
    let fakeUsers: FakeUser[];
    let server: Server;
    let apps: Array<{ app: Application; serverUrl: string }>;

    test.beforeAll(async () => {
      apps = await Promise.all([prepareApplication(APP_1_ENV_KEY), prepareApplication(APP_2_ENV_KEY)]);

      // TODO: Move this into createProxyServer
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };

      server = createProxyServer({
        ssl,
        targets: {
          [hosts[0]]: apps[0].serverUrl,
          [hosts[1]]: apps[1].serverUrl,
        },
      });

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
      server.close();
    });

    test('the cookies are independent for the root and sub domains', async ({ context }) => {
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      const u = [
        createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
        createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
      ];

      await u[0].page.goto(`https://${hosts[0]}`);
      await u[0].po.signIn.goTo();
      await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
      await u[0].po.expect.toBeSignedIn();
      const tab0User = await u[0].po.clerk.getClientSideUser();
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[0].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab0User.id);

      // Check that the cookies are set as expected
      const tab0Cookies = await u[0].page.cookies();
      expect(tab0Cookies.get('__client')).toBeDefined();
      expect(tab0Cookies.get('__client_*')).not.toBeDefined();
      expect(tab0Cookies.get('__client').domain).toBe(`.clerk.${hosts[0].split(':')[0]}`);
      expect(tab0Cookies.get('__client').httpOnly).toBeTruthy();

      expect(tab0Cookies.get('__session')).toBeDefined();
      expect(tab0Cookies.get('__session').domain).toEqual(hosts[0].split(':')[0]);

      // ensure that only 2 client_uat cookies (base and suffixed variant) are visible here
      expect([...tab0Cookies.values()].filter(c => c.name.startsWith('__client_uat')).length).toEqual(2);
      // The client_uat cookie should always be set on etld+1
      expect(tab0Cookies.get('__client_uat_*').domain).toEqual('.' + hosts[0].split(':')[0]);

      await u[1].po.expect.toBeHandshake(await u[1].page.goto(`https://${hosts[1]}`));
      await u[1].po.expect.toBeSignedOut();
      expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(null);

      await u[1].po.signIn.goTo();
      await u[1].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[1]);
      await u[1].po.expect.toBeSignedIn();
      const tab1User = await u[1].po.clerk.getClientSideUser();
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab1User.id);
      // We have two different users at this point
      expect(tab0User.id).not.toEqual(tab1User.id);

      // Check that the cookies are set as expected
      const tab1Cookies = await u[1].page.cookies();
      expect(tab1Cookies.get('__client')).toBeDefined();
      expect(tab1Cookies.get('__client_*')).not.toBeDefined();
      expect(tab1Cookies.get('__client').domain).toBe(`.clerk.${hosts[1].split(':')[0]}`);

      expect(tab1Cookies.get('__session')).toBeDefined();
      expect(tab1Cookies.get('__session').domain).toEqual(hosts[1].split(':')[0]);

      // ensure that all client_uat cookies are still set on the root domain
      expect(tab1Cookies.get('__client_uat_*').domain).toEqual('.' + hosts[0].split(':')[0]);
      // we have 3 client_uat cookies here: 1 base and 2 suffixed variants
      expect(tab1Cookies.raw().filter(c => c.name.startsWith('__client_uat')).length).toEqual(3);
    });

    test('signing out from the root domains does not affect the sub domain', async ({ context }) => {
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      const u = [
        createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
        createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
      ];

      // signin in tab0
      await u[0].page.goto(`https://${hosts[0]}`);
      await u[0].po.signIn.goTo();
      await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
      await u[0].po.expect.toBeSignedIn();

      // signin in tab1
      await u[1].page.goto(`https://${hosts[1]}`);
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

  /**
   * This smoke test verifies that the session is not shared between different apps running on different same-level subdomains, while
   * using different Clerk instances. For extra details, look at the previous test.
   *
   * sub1.test.com <> clerk-instance-1
   * sub2.test.com <> clerk-instance-2
   *
   */
  test.describe('multiple apps different same-level subdomains  for different production instances', () => {
    const hosts = [`sub-1.${APP_1_HOST}:8443`, `sub-2.${APP_1_HOST}:8443`];
    let fakeUsers: FakeUser[];
    let server: Server;
    let apps: Array<{ app: Application; serverUrl: string }>;

    test.beforeAll(async () => {
      apps = await Promise.all([prepareApplication(APP_1_ENV_KEY), prepareApplication(APP_2_ENV_KEY)]);

      // TODO: Move this into createProxyServer
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };

      server = createProxyServer({
        ssl,
        targets: {
          [hosts[0]]: apps[0].serverUrl,
          [hosts[1]]: apps[1].serverUrl,
        },
      });

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
      server.close();
    });

    test('the cookies are independent for the root and sub domains', async ({ context }) => {
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      const u = [
        createTestUtils({ app: apps[0].app, page: pages[0], context, useTestingToken: false }),
        createTestUtils({ app: apps[1].app, page: pages[1], context, useTestingToken: false }),
      ];

      await u[0].page.goto(`https://${hosts[0]}`);
      await u[0].po.signIn.goTo();
      await u[0].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[0]);
      await u[0].po.expect.toBeSignedIn();
      const tab0User = await u[0].po.clerk.getClientSideUser();
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[0].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab0User.id);

      await u[1].po.expect.toBeHandshake(await u[1].page.goto(`https://${hosts[1]}`));
      await u[1].po.expect.toBeSignedOut();
      expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(null);

      await u[1].po.signIn.goTo();
      await u[1].po.signIn.signInWithEmailAndInstantPassword(fakeUsers[1]);
      await u[1].po.expect.toBeSignedIn();
      const tab1User = await u[1].po.clerk.getClientSideUser();
      // make sure that the backend user now matches the user we signed in with on the client
      expect((await u[1].page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(tab1User.id);
    });
  });
});
