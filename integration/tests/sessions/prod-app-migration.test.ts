import type { Server, ServerOptions } from 'node:https';

import { expect, test } from '@playwright/test';

import { constants } from '../../constants';
import { appConfigs } from '../../presets';
import { fs, getPort } from '../../scripts';
import { createProxyServer } from '../../scripts/proxyServer';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { getEnvForMultiAppInstance } from './utils';

test.describe('root and subdomain production apps @manual-run', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('multiple apps same domain for production instances', () => {
    const host = 'multiple-apps-e2e.clerk.app';
    const fakeUsers: FakeUser[] = [];

    let server: Server;

    test.afterAll(async () => {
      await Promise.all(fakeUsers.map(u => u.deleteIfExists()));
      server.close();
    });

    test('apps can be used without clearing the cookies after instance switch', async ({ context }) => {
      // We need both apps to run on the same port
      const port = await getPort();

      const apps = await Promise.all([
        // Last version before multi-app-same-domain support
        await appConfigs.next.appRouter.clone().addDependency('@clerk/nextjs', '5.2.4').commit(),
        // Locally-built SDKs
        await appConfigs.next.appRouter.clone().commit(),
      ]);

      // Write both apps to the disk and install dependencies
      await Promise.all(apps.map(a => a.setup()));

      // Start the app with the older SDK version and let it hotload clerkjs from the CF worker
      let app = apps[0];
      await app.withEnv(getEnvForMultiAppInstance('sessions-prod-1').setEnvVariable('public', 'CLERK_JS_URL', ''));
      await app.dev({ port });

      // Prepare the proxy server tha maps from the prod domain to the local apps
      // We don't need to restart this one as the serverUrl will be the same for both apps
      const ssl: Pick<ServerOptions, 'ca' | 'cert' | 'key'> = {
        cert: fs.readFileSync(constants.CERTS_DIR + '/sessions.pem'),
        key: fs.readFileSync(constants.CERTS_DIR + '/sessions-key.pem'),
      };
      server = createProxyServer({ ssl, targets: { [host]: apps[0].serverUrl } });

      const page = await context.newPage();
      let u = createTestUtils({ app, page, context });

      const fakeUser = u.services.users.createFakeUser();
      fakeUsers.push(fakeUser);
      await u.services.users.createBapiUser(fakeUser);

      await u.page.goto(`https://${host}`);
      await u.po.signIn.goTo({ timeout: 30000 });
      await u.po.signIn.signInWithEmailAndInstantPassword(fakeUser);
      await u.po.expect.toBeSignedIn();

      expect((await u.po.clerk.getClientSideUser()).primaryEmailAddress.emailAddress).toBe(fakeUser.email);
      expect((await u.page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(
        (await u.po.clerk.getClientSideUser()).id,
      );

      await u.page.pause();
      // TODO
      // Add cookie checks
      // ...

      await app.stop();

      // Switch to and start the app with the latest SDK version
      app = apps[1];
      await app.withEnv(getEnvForMultiAppInstance('sessions-prod-1'));
      await app.dev({ port });

      await page.reload();
      u = createTestUtils({ app, page, context });

      await u.po.expect.toBeSignedIn();

      expect((await u.po.clerk.getClientSideUser()).primaryEmailAddress.emailAddress).toBe(fakeUser.email);
      expect((await u.page.evaluate(() => fetch('/api/me').then(r => r.json()))).userId).toBe(
        (await u.po.clerk.getClientSideUser()).id,
      );

      await u.page.pause();
      // TODO
      // Add cookie checks
      // ...

      await Promise.all(apps.map(a => a.teardown()));
    });
  });
});
