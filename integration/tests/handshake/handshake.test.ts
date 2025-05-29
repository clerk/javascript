import type { Server, ServerOptions } from 'node:https';

import { expect, test } from '@playwright/test';

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
      await u.po.signIn.signInWithEmailAndInstantPassword(<any>fakeUser);
      await u.po.expect.toBeSignedIn();
      await u.page.pause();

      // delete the client uat cookie etc..
      const cookies = await u.page.context().cookies();
      // console.log('cookies', cookies);
      const clientUatCookies = cookies.filter(c => c.name.startsWith('__client_uat'));
      expect(clientUatCookies.length).toBeGreaterThan(0);
      await context.clearCookies({ name: /__client_uat.*/ });
      await u.page.pause();

      // debug: verify that the cookies are deleted
      const cookies2 = await u.page.context().cookies();
      // console.log('cookies2', cookies2);
      const clientUatCookies2 = cookies2.filter(c => c.name.startsWith('__client_uat'));
      expect(clientUatCookies2.length).toBe(0);

      // go to the protected page
      await u.page.goToRelative('/protected');
      await u.po.expect.toBeSignedIn();
      await u.page.pause();
    });
  });
});
