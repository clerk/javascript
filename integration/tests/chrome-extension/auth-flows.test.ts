import type { ClerkClient } from '@clerk/backend';
import { createPageObjects } from '@clerk/testing/playwright/unstable';

import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';
import { createEmailService } from '../../testUtils/emailService';
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
    test.describe.configure({ mode: 'serial' });

    let services: { clerk: ClerkClient; users: UserService };
    let user: FakeUser;
    let addedOrigin: string | undefined;

    test.beforeAll(async ({ extensionApp }) => {
      const publishableKey = extensionApp.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
      expect(publishableKey?.startsWith(environmentType === 'production' ? 'pk_live_' : 'pk_test_')).toBe(true);
      ({ services } = await createTestUtils({ app: extensionApp }));
    });

    test.beforeEach(async ({ extensionId }) => {
      user = services.users.createFakeUser(test, {
        fictionalEmail: environmentType === 'development',
      });

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
        if (addedOrigin) {
          const instance = await services.clerk.instance.get();
          await services.clerk.instance.update({
            allowedOrigins: (instance.allowedOrigins || []).filter(origin => origin !== addedOrigin),
          });
          addedOrigin = undefined;
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

    test('signs up with email and password without a Testing Token', async ({ extensionPage }) => {
      await extensionPage.getByRole('button', { name: 'Create account', exact: true }).click();
      const { signUp } = createPageObjects({ page: extensionPage, useTestingToken: false });
      await signUp.waitForMounted();
      await signUp.signUpWithEmailAndPassword({ email: user.email, password: user.password });

      if (environmentType === 'development') {
        await signUp.enterTestOtpCode();
      } else {
        const code = await createEmailService().getCodeForEmailAddress(user.email!);
        await signUp.enterOtpCode(code);
      }

      await expect(extensionPage.getByTestId('user-id')).toHaveText(/^user_/);
      await expect(extensionPage.getByTestId('session-id')).toHaveText(/^sess_/);
    });
  });
}
