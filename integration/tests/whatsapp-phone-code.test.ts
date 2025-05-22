import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('sign up and sign in with WhatsApp phone code @generic', () => {
  const configs = [appConfigs.next.appRouter];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {
      test.describe.configure({ mode: 'serial' });

      let app: Application;
      let fakeUser: FakeUser;

      test.beforeAll(async () => {
        app = await config.commit();
        await app.setup();
        await app.withEnv(appConfigs.envs.withWhatsappPhoneCode);
        await app.dev();
        fakeUser = createTestUtils({ app }).services.users.createFakeUser({
          withEmail: false,
          withPhoneNumber: true,
          withPassword: false,
        });
      });

      test.afterAll(async () => {
        await fakeUser.deleteIfExists();
        await app.teardown();
      });

      test('sign up', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signUp.goTo();

        // intercept the request to /sign_ups
        await page.context().route('**/sign_ups*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();

          expect(body.strategy).toBe('phone_code');
          expect(body.phone_number).toBe(fakeUser.phoneNumber.replace(/\s/g, ''));
          expect(body.channel).toBe('whatsapp');

          await route.continue();
        });

        // Click on WhatsApp button
        await page.getByRole('button', { name: new RegExp(`WhatsApp`, 'gi') }).click();
        // Fill in sign up form with phone number
        await u.po.signUp.signUp({
          phoneNumber: fakeUser.phoneNumber,
        });

        // intercept the request to /prepare_verification
        await page.context().route('**/prepare_verification*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();
          expect(body.strategy).toBe('phone_code');
          expect(body.channel).toBeUndefined();
          await route.continue();
        });

        // Click the "Use SMS instead" button
        await page.getByRole('link', { name: new RegExp(`SMS`, 'gi') }).click();

        // Verify phone number
        await u.po.signUp.enterTestOtpCode();
        await u.po.expect.toBeSignedIn();
      });

      test('sign in', async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();

        // intercept the request to /sign_in
        await page.context().route('**/sign_ins*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();
          expect(body.strategy).toBe('phone_code');
          expect(body.identifier).toBe(fakeUser.phoneNumber.replace(/\s/g, ''));
          expect(body.channel).toBe('whatsapp');

          await route.continue();
        });

        // Click on WhatsApp button
        await page.getByRole('button', { name: new RegExp(`WhatsApp`, 'gi') }).click();
        // Fill in WhatsApp sign in form with phone number
        await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
        await u.po.signIn.continue();

        // intercept the request to /prepare_first_factor
        await page.context().route('**/prepare_first_factor*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();
          expect(body.strategy).toBe('phone_code');
          expect(body.channel).toBeUndefined();
          await route.continue();
        });

        // Click the "Use SMS instead" button
        await page.getByRole('link', { name: new RegExp(`SMS`, 'gi') }).click();

        // Verify phone number
        await u.po.signIn.enterTestOtpCode();
        await u.po.expect.toBeSignedIn();
      });

      test('sign-in with the normal phone code flow, using a US test phone number (starts with +1), where the preferred channel is WhatsApp for this instance', async ({
        page,
        context,
      }) => {
        const u = createTestUtils({ app, page, context });
        await u.po.signIn.goTo();

        // intercept the request to /sign_in
        await page.context().route('**/sign_ins*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();
          expect(body.strategy).toBe('phone_code');
          expect(body.identifier).toBe(fakeUser.phoneNumber.replace(/\s/g, ''));
          expect(body.channel).toBe('whatsapp');

          await route.continue();
        });

        // Fill in the sign in form with the test US phone number
        await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
        await u.po.signIn.continue();

        // intercept the request to /prepare_first_factor
        await page.context().route('**/prepare_first_factor*', async route => {
          const request = route.request();
          const body = await request.postDataJSON();
          expect(body.strategy).toBe('phone_code');
          expect(body.channel).toBeUndefined();
          await route.continue();
        });

        // Click the "Use SMS instead" button
        await page.getByRole('link', { name: new RegExp(`SMS`, 'gi') }).click();

        // Verify phone number
        await u.po.signIn.enterTestOtpCode();
        await u.po.expect.toBeSignedIn();
      });
    });
  });
});
