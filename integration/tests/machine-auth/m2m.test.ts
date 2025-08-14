import { createClerkClient, type M2MToken, type Machine } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { instanceKeys } from '../../presets/envs';
import { createTestUtils } from '../../testUtils';

test.describe('machine-to-machine auth @machine', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let primaryApiServer: Machine;
  let emailServer: Machine;
  let analyticsServer: Machine;
  let emailServerM2MToken: M2MToken;
  let analyticsServerM2MToken: M2MToken;

  test.beforeAll(async () => {
    const fakeCompanyName = faker.company.name();

    // Create primary machine using instance secret key
    const client = createClerkClient({
      secretKey: instanceKeys.get('with-api-keys').sk,
    });
    primaryApiServer = await client.machines.create({
      name: `${fakeCompanyName} Primary API Server`,
    });

    app = await appConfigs.express.vite
      .clone()
      .addFile(
        'src/server/main.ts',
        () => `
        import 'dotenv/config';
        import { clerkClient } from '@clerk/express';
        import express from 'express';
        import ViteExpress from 'vite-express';

        const app = express();

        app.get('/api/protected', async (req, res) => {
          const token = req.get('Authorization')?.split(' ')[1];
          
          try {
            const m2mToken = await clerkClient.m2m.verifyToken({ token });
            res.send('Protected response ' + m2mToken.id);
          } catch {
            res.status(401).send('Unauthorized');
          }
        });

        const port = parseInt(process.env.PORT as string) || 3002;
        ViteExpress.listen(app, port, () => console.log('Server started'));
        `,
      )
      .commit();

    await app.setup();

    // Using the created machine, set a machine secret key using the primary machine's secret key
    const env = appConfigs.envs.withAPIKeys
      .clone()
      .setEnvVariable('private', 'CLERK_MACHINE_SECRET_KEY', primaryApiServer.secretKey);
    await app.withEnv(env);
    await app.dev();

    // Email server can access primary API server
    emailServer = await client.machines.create({
      name: `${fakeCompanyName} Email Server`,
      scopedMachines: [primaryApiServer.id],
    });
    emailServerM2MToken = await client.m2m.createToken({
      machineSecretKey: emailServer.secretKey,
      secondsUntilExpiration: 60 * 30,
    });

    // Analytics server cannot access primary API server
    analyticsServer = await client.machines.create({
      name: `${fakeCompanyName} Analytics Server`,
      // No scoped machines
    });
    analyticsServerM2MToken = await client.m2m.createToken({
      machineSecretKey: analyticsServer.secretKey,
      secondsUntilExpiration: 60 * 30,
    });
  });

  test.afterAll(async () => {
    const client = createClerkClient({
      secretKey: instanceKeys.get('with-api-keys').sk,
    });

    await client.m2m.revokeToken({
      m2mTokenId: emailServerM2MToken.id,
    });
    await client.m2m.revokeToken({
      m2mTokenId: analyticsServerM2MToken.id,
    });
    await client.machines.delete(emailServer.id);
    await client.machines.delete(primaryApiServer.id);
    await client.machines.delete(analyticsServer.id);

    await app.teardown();
  });

  test('rejects requests with invalid M2M tokens', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const res = await u.page.request.get(app.serverUrl + '/api/protected', {
      headers: {
        Authorization: `Bearer invalid`,
      },
    });
    expect(res.status()).toBe(401);
    expect(await res.text()).toBe('Unauthorized');

    const res2 = await u.page.request.get(app.serverUrl + '/api/protected', {
      headers: {
        Authorization: `Bearer mt_xxx`,
      },
    });
    expect(res2.status()).toBe(401);
    expect(await res2.text()).toBe('Unauthorized');
  });

  test('rejects M2M requests when sender machine lacks access to receiver machine', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const res = await u.page.request.get(app.serverUrl + '/api/protected', {
      headers: {
        Authorization: `Bearer ${analyticsServerM2MToken.token}`,
      },
    });
    expect(res.status()).toBe(401);
    expect(await res.text()).toBe('Unauthorized');
  });

  test('authorizes M2M requests when sender machine has proper access to receiver machine', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });

    // Email server can access primary API server
    const res = await u.page.request.get(app.serverUrl + '/api/protected', {
      headers: {
        Authorization: `Bearer ${emailServerM2MToken.token}`,
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('Protected response ' + emailServerM2MToken.id);

    // Analytics server can access primary API server after adding scope
    await u.services.clerk.machines.createScope(analyticsServer.id, primaryApiServer.id);
    const m2mToken = await u.services.clerk.m2m.createToken({
      machineSecretKey: analyticsServer.secretKey,
      secondsUntilExpiration: 60 * 30,
    });

    const res2 = await u.page.request.get(app.serverUrl + '/api/protected', {
      headers: {
        Authorization: `Bearer ${m2mToken.token}`,
      },
    });
    expect(res2.status()).toBe(200);
    expect(await res2.text()).toBe('Protected response ' + m2mToken.id);
    await u.services.clerk.m2m.revokeToken({
      m2mTokenId: m2mToken.id,
    });
  });
});
