import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';
import { testSignIn, testSignUp, testSSR } from './common';

test.describe('Next with ClerkJS V6 <-> Account Portal Core 1 @ap-flows', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(90_000); // Wait for app to be ready
    app = await appConfigs.next.appRouterAPWithClerkNextV6.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withAPCore1ClerkV6);

    const publishableKey = app.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = app.env.privateVariables.get('CLERK_SECRET_KEY');
    const { frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);
    await clerkSetup({ publishableKey, frontendApiUrl, secretKey });

    await app.dev();
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('sign in', async ({ page, context }) => {
    await testSignIn({ app, page, context, fakeUser });
  });

  test('sign up', async ({ page, context }) => {
    await testSignUp({ app, page, context, fakeUser });
  });

  test('ssr', async ({ page, context }) => {
    await testSSR({ app, page, context, fakeUser });
  });
});
