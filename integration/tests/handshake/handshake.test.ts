import type { Server, ServerOptions } from 'node:https';

import { test } from '@playwright/test';

import { constants } from '../../constants';
import { fs } from '../../scripts';
import { createProxyServer } from '../../scripts/proxyServer';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouter.sessionsProd1'] })('handshake flow @handshake', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.describe('todo', () => {
    const host = 'multiple-apps-e2e.clerk.app:8443';

    let fakeUser: FakeUser;
    let server: Server;

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      server.close();
    });

    test.beforeAll(async () => {
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

    test('apps can be used without clearing the cookies after instance switch', async ({ context }) => {
      const page = await context.newPage();
      const u = createTestUtils({ app, page, context, useTestingToken: false });

      await u.page.pause();

      await u.page.goto(`https://${host}`);

      await u.po.signIn.goTo();
      // TODO: need to fix the type here
      await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u.po.expect.toBeSignedIn();
      await u.page.pause();

      // go to the protected page
      // delete the client uat cookie etc..
    });
  });
});
