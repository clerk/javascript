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
    let addedOrigin: string | undefined;
    let restoreTestMode = false;

    test.beforeAll(async ({ extensionApp }) => {
      const publishableKey = extensionApp.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
      expect(publishableKey?.startsWith(environmentType === 'production' ? 'pk_live_' : 'pk_test_')).toBe(true);
      ({ services } = await createTestUtils({ app: extensionApp }));
    });

    test.beforeEach(async ({ extensionId }) => {
      user = services.users.createFakeUser(test, { fictionalEmail: true });

      if (environmentType === 'production') {
        const origin = `chrome-extension://${extensionId}`;
        const instance = await services.clerk.instance.get();
        if (!instance.allowedOrigins?.includes(origin)) {
          await services.clerk.instance.update({ allowedOrigins: [...(instance.allowedOrigins || []), origin] });
          addedOrigin = origin;
        }
      }
    });

    test.afterEach(async () => {
      try {
        await user?.deleteIfExists();
      } finally {
        try {
          if (addedOrigin) {
            const instance = await services.clerk.instance.get();
            await services.clerk.instance.update({
              allowedOrigins: (instance.allowedOrigins || []).filter(origin => origin !== addedOrigin),
            });
            addedOrigin = undefined;
          }
        } finally {
          if (restoreTestMode) {
            await services.clerk.instance.update({ testMode: false });
            restoreTestMode = false;
          }
        }
      }
    });

    test('signs in with email and password without a Testing Token', async ({ extensionPage }) => {
      await services.users.createBapiUser(user);
      const { signIn } = createPageObjects({ page: extensionPage, useTestingToken: false });
      await signIn.waitForMounted();
      await signIn.setIdentifier(user.email!);
      await signIn.continue();
      await signIn.getPasswordInput().fill(user.password);
      await signIn.continue();
      await expect(extensionPage.getByTestId('user-id')).toHaveText(/^user_/);
      await expect(extensionPage.getByTestId('session-id')).toHaveText(/^sess_/);
    });

    test('signs up with email and password without a Testing Token', async ({ extensionPage, extensionApp }) => {
      if (environmentType === 'production') {
        const { frontendApi } = parsePublishableKey(extensionApp.env.publicVariables.get('CLERK_PUBLISHABLE_KEY'), {
          fatal: true,
        });
        const response = await fetch(`https://${frontendApi}/v1/environment?_is_native=1`);
        expect(response.ok).toBe(true);
        const environment = await response.json();
        expect(typeof environment.auth_config.test_mode).toBe('boolean');
        restoreTestMode = !environment.auth_config.test_mode;
        if (restoreTestMode) {
          await services.clerk.instance.update({ testMode: true });
        }
      }

      await extensionPage.getByRole('button', { name: 'Create account', exact: true }).click();
      const { signUp } = createPageObjects({ page: extensionPage, useTestingToken: false });
      await signUp.waitForMounted();
      const [response] = await Promise.all([
        extensionPage.waitForResponse(
          response =>
            response.request().method() === 'POST' && new URL(response.url()).pathname === '/v1/client/sign_ups',
        ),
        signUp.signUpWithEmailAndPassword({ email: user.email, password: user.password }),
      ]);
      expect(response.ok()).toBe(true);
      await signUp.enterTestOtpCode({ awaitPrepare: false });

      await expect(extensionPage.getByTestId('user-id')).toHaveText(/^user_/);
      await expect(extensionPage.getByTestId('session-id')).toHaveText(/^sess_/);
    });
  });
}
