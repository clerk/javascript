import type { Server, ServerOptions } from 'node:https';

import { test } from '@playwright/test';

import { constants } from '../../constants';
import { fs } from '../../scripts';
import { createProxyServer } from '../../scripts/proxyServer';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouter.sessionsProd1'] })('handshake flow @handshake', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.describe('with Production instance', () => {
    // TODO: change host name
    const host = 'multiple-apps-e2e.clerk.app:8443';

    let fakeUser: FakeUser;
    let server: Server;

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      server.close();
    });

    test.beforeAll(async () => {
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
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test('when the client uat cookies are deleted', async ({ context }) => {
      const page = await context.newPage();
      const u = createTestUtils({ app, page, context, useTestingToken: false });

      await u.page.goto(`https://${host}`);

      await u.po.signIn.goTo();
      // TODO: need to fix the type here
      await u.po.signIn.signInWithEmailAndInstantPassword(<any>fakeUser);
      await u.po.expect.toBeSignedIn();

      // delete the client uat cookies to force a handshake flow
      await context.clearCookies({ name: /__client_uat.*/ });

      // go to the protected page (the handshake should happen here)
      await u.page.goToRelative('/protected');

      await u.po.expect.toBeSignedIn();
      // TODO: expect to be on the protected page
      // TODO: expect to have valid cookies (session, client_uat, etc)
      // TODO: expect not to have temporary cookies (e.g. handshake nonce)
    });
  });
});
