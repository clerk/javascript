import type { Server, ServerOptions } from 'node:https';

import { test } from '@playwright/test';

import { constants } from '../constants';
import { fs } from '../scripts';
import { createProxyServer } from '../scripts/proxyServer';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouter.sessionsProd1'] })('handshake flow @handshake', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  test.describe('todo', () => {
    const host = 'multiple-apps-e2e.clerk.app';
    const fakeUsers: FakeUser[] = [];

    let server: Server;

    test.afterAll(async () => {
      await Promise.all(fakeUsers.map(u => u.deleteIfExists()));
      server.close();
    });

    test('apps can be used without clearing the cookies after instance switch', async ({ context }) => {
      // Prepare the proxy server tha maps from the prod domain to the local apps
      // We don't need to restart this one as the serverUrl will be the same for both apps
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };
      server = createProxyServer({ ssl, targets: { [host]: app.serverUrl } });

      const page = await context.newPage();
      const u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      fakeUsers.push(fakeUser);
      await u.services.users.createBapiUser(fakeUser);

      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(fakeUser.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(fakeUser.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();
    });
  });
});
