import type { ClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import { createPageObjects } from '@clerk/testing/playwright/unstable';

import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';
import type { FakeUser, UserService } from '../../testUtils/usersService';
import { expect, test as extensionTest } from './fixtures';

for (const environmentType of ['development', 'production'] as const) {
  const test = extensionTest.extend({
    extensionEnv: [
      environmentType === 'production' ? appConfigs.envs.sessionsProd1 : appConfigs.envs.withEmailCodes,
      { scope: 'worker' },
    ],
    extensionTestingToken: [false, { scope: 'worker' }],
  });

  test.describe(`chrome extension ${environmentType} auth @chrome-extension`, () => {
    test.describe.configure({ mode: 'default', timeout: 90_000 });

    let services: { clerk: ClerkClient; users: UserService };
    let user: FakeUser;

    test.beforeAll(async ({ extensionApp }) => {
      const publishableKey = extensionApp.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
      expect(publishableKey?.startsWith(environmentType === 'production' ? 'pk_live_' : 'pk_test_')).toBe(true);
      ({ services } = await createTestUtils({ app: extensionApp }));

      if (environmentType === 'production') {
        const { frontendApi } = parsePublishableKey(publishableKey, { fatal: true });
        const readTestMode = async () => {
          const response = await fetch(`https://${frontendApi}/v1/environment?_is_native=1`);
          return response.ok ? (await response.json()).auth_config?.test_mode : undefined;
        };

        if ((await readTestMode()) !== true) {
          await services.clerk.instance.update({ testMode: true });
          await expect.poll(readTestMode, { timeout: 60_000, intervals: [1_000, 2_000, 5_000] }).toBe(true);
        }
      }
    });

    test.beforeEach(async ({ extensionId }) => {
      user = services.users.createFakeUser(test, { fictionalEmail: true });

      if (environmentType === 'production') {
        const origin = `chrome-extension://${extensionId}`;
        const instance = await services.clerk.instance.get();
        if (!instance.allowedOrigins?.includes(origin)) {
          await services.clerk.instance.update({ allowedOrigins: [...(instance.allowedOrigins || []), origin] });
        }
      }
    });

    test.afterEach(async () => {
      await user?.deleteIfExists();
    });

    test('signs in with email and password without a Testing Token', async ({ extensionPage }) => {
      await services.users.createBapiUser(user);
      const { signIn } = createPageObjects({ page: extensionPage, useTestingToken: false });
      await signIn.waitForMounted();
      await signIn.setIdentifier(user.email!);
      await signIn.continue();
      await signIn.getPasswordInput().fill(user.password);
      await signIn.continue();
      await expect(extensionPage.getByTestId('user-id')).toHaveText(/^user_/, { timeout: 30_000 });
      await expect(extensionPage.getByTestId('session-id')).toHaveText(/^sess_/);
    });

    test('signs up with email and password without a Testing Token', async ({ extensionPage }) => {
      test.fail(environmentType === 'development', 'Known issue: development sign-up from an extension is rejected');
      await extensionPage.getByRole('button', { name: 'Create account', exact: true }).click();
      const { signUp } = createPageObjects({ page: extensionPage, useTestingToken: false });
      await signUp.waitForMounted();
      const preparation = extensionPage
        .waitForResponse(
          response =>
            response.request().method() === 'POST' &&
            new URL(response.url()).pathname.startsWith('/v1/client/sign_ups/') &&
            new URL(response.url()).pathname.endsWith('/prepare_verification'),
        )
        .catch(() => undefined);
      const [response] = await Promise.all([
        extensionPage.waitForResponse(
          response =>
            response.request().method() === 'POST' && new URL(response.url()).pathname === '/v1/client/sign_ups',
        ),
        signUp.signUpWithEmailAndPassword({ email: user.email, password: user.password }),
      ]);
      expect(response.ok()).toBe(true);
      expect((await preparation)?.ok()).toBe(true);
      await signUp.enterTestOtpCode({ awaitPrepare: false });

      await expect(extensionPage.getByTestId('user-id')).toHaveText(/^user_/, { timeout: 30_000 });
      await expect(extensionPage.getByTestId('session-id')).toHaveText(/^sess_/);
    });
  });
}
