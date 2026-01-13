import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';
import { stringPhoneNumber } from '../testUtils/phoneUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasksSetupMfa] })(
  'session tasks setup-mfa flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await u.services.organizations.deleteAll();
      await app.teardown();
    });

    test.afterEach(async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.signOut();
      await u.page.context().clearCookies();
    });

    test('setup MFA with new phone number - happy path', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      await u.page.getByRole('button', { name: /use a different phone number/i }).click();

      const testPhoneNumber = '+15555550100';
      await u.page.getByLabel(/phone number/i).fill(testPhoneNumber);
      await u.page.getByRole('button', { name: /continue/i }).click();

      await u.page.getByLabel(/enter code/i).waitFor({ state: 'visible' });
      await u.page.getByLabel(/enter code/i).fill('424242');

      await u.page.getByText(/backup codes/i).waitFor({ state: 'visible', timeout: 10000 });
      await u.page.getByText(/save these codes/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /finish/i }).click();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('setup MFA with existing phone number - happy path', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const formattedPhoneNumber = stringPhoneNumber(user.phoneNumber);
      await u.page
        .getByRole('button', {
          name: formattedPhoneNumber,
        })
        .click();

      await u.page.getByLabel(/enter code/i).waitFor({ state: 'visible' });
      await u.page.getByLabel(/enter code/i).fill('424242');

      await u.page.getByText(/backup codes/i).waitFor({ state: 'visible', timeout: 10000 });
      await u.page.getByText(/save these codes/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /finish/i }).click();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('setup MFA with invalid phone number - error handling', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      await u.page.getByRole('button', { name: /use a different phone number/i }).click();

      const invalidPhoneNumber = '123';
      await u.page.getByLabel(/phone number/i).fill(invalidPhoneNumber);
      await u.page.getByRole('button', { name: /continue/i }).click();

      await expect(u.page.getByText(/is invalid/i)).toBeVisible();

      const validPhoneNumber = '+15555550100';
      await u.page.getByLabel(/phone number/i).fill(validPhoneNumber);
      await u.page.getByRole('button', { name: /continue/i }).click();

      await u.page.getByLabel(/enter code/i).waitFor({ state: 'visible' });
      await u.page.getByLabel(/enter code/i).fill('424242');

      await u.page.getByText(/backup codes/i).waitFor({ state: 'visible', timeout: 10000 });

      await u.page.getByRole('button', { name: /finish/i }).click();

      await u.page.waitForAppUrl('/page-protected');

      await user.deleteIfExists();
    });

    test('setup MFA with invalid verification code - error handling', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      await u.page.getByRole('button', { name: /use a different phone number/i }).click();

      const testPhoneNumber = '+15555550100';
      await u.page.getByLabel(/phone number/i).fill(testPhoneNumber);
      await u.page.getByRole('button', { name: /continue/i }).click();

      await u.page.getByLabel(/enter code/i).waitFor({ state: 'visible' });
      await u.page.getByLabel(/enter code/i).fill('111111');

      await expect(u.page.getByText(/incorrect/i)).toBeVisible();

      await u.page.getByLabel(/enter code/i).fill('424242');

      await u.page.getByText(/backup codes/i).waitFor({ state: 'visible', timeout: 10000 });
      await u.page.getByText(/save these codes/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /finish/i }).click();

      await u.page.waitForAppUrl('/page-protected');
      await u.po.expect.toBeSignedIn();

      await user.deleteIfExists();
    });

    test('can navigate back during MFA setup', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      const user = u.services.users.createFakeUser({
        fictionalEmail: true,
        withPhoneNumber: true,
        withPassword: true,
      });
      await u.services.users.createBapiUser(user);

      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: user.email, password: user.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/page-protected');

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });

      await u.page.getByRole('button', { name: /sms code/i }).click();

      const formattedPhoneNumber = stringPhoneNumber(user.phoneNumber);
      await u.page
        .getByRole('button', {
          name: formattedPhoneNumber,
        })
        .waitFor({ state: 'visible' });

      await u.page.getByRole('link', { name: /back/i }).first().click();

      await u.page.getByText(/set up two-step verification/i).waitFor({ state: 'visible' });
      await u.page.getByRole('button', { name: /sms code/i }).waitFor({ state: 'visible' });

      await user.deleteIfExists();
    });
  },
);
