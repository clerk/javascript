import type { Server, ServerOptions } from 'node:https';

import { expect, test } from '@playwright/test';

import { constants } from '../../constants';
import { fs } from '../../scripts';
import { createProxyServer } from '../../scripts/proxyServer';
import type { FakeUserWithEmail } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouter.sessionsProd1'] })('handshake flow @handshake', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.describe('with Production instance', () => {
    // TODO: change host name (see integration/README.md#production-hosts)
    const host = 'multiple-apps-e2e.clerk.app:8443';

    let fakeUser: FakeUserWithEmail;
    let server: Server;

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      server.close();
    });

    test.beforeAll(async () => {
      // GIVEN a Production App and Clerk instance
      // TODO: Factor out proxy server creation to helper
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };

      server = createProxyServer({
        ssl,
        targets: {
          [host]: app.serverUrl,
        },
      });

      const u = createTestUtils({ app, useTestingToken: false });
      // AND an existing user in the instance
      fakeUser = u.services.users.createFakeUser({ withEmail: true }) as FakeUserWithEmail;
      await u.services.users.createBapiUser(fakeUser);
    });

    test('when the client uat cookies are deleted', async ({ context }) => {
      const page = await context.newPage();
      const u = createTestUtils({ app, page, context, useTestingToken: false });

      // GIVEN the user is signed into the app on the app homepage
      await u.page.goto(`https://${host}`);
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u.po.expect.toBeSignedIn();

      // AND the user has no client uat cookies
      // (which forces a handshake flow)
      await context.clearCookies({ name: /__client_uat.*/ });

      // WHEN the user goes to the protected page
      // (the handshake should happen here)
      await u.page.goToRelative('/protected');

      // THEN the user is signed in
      await u.po.expect.toBeSignedIn();
      // AND the user is on the protected page
      expect(u.page.url()).toBe(`https://${host}/protected`);
      // AND the user has valid cookies (session, client_uat, refresh, etc)
      const cookies = await u.page.context().cookies();
      const clientUatCookies = cookies.filter(c => c.name.startsWith('__client_uat'));
      // TODO: should we be more specific about the number of cookies? (some are suffixed, some are not)
      expect(clientUatCookies.length).toBeGreaterThan(0);
      const sessionCookies = cookies.filter(c => c.name.startsWith('__session'));
      expect(sessionCookies.length).toBeGreaterThan(0);
      const refreshCookies = cookies.filter(c => c.name.startsWith('__refresh'));
      expect(refreshCookies.length).toBeGreaterThan(0);
      // AND the user does not have temporary cookies (e.g. __clerk_handshake, __clerk_handshake_nonce)
      const handshakeCookies = cookies.filter(c => c.name.includes('handshake'));
      expect(handshakeCookies.length).toBe(0);
    });
  });
});
