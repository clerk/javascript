import type { Browser, BrowserContext, Page } from '@playwright/test';
import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { createTestUtils } from '../testUtils';

test.describe('sign up and sign in using email link', () => {
  const configs = [appConfigs.longRunning.react.viteEmailLink, appConfigs.remix.remixNode];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {
      test.describe.configure({ mode: 'parallel' });

      let app: Application;

      test.beforeAll(async () => {
        app = await config.commit();
        await app.setup();
        await app.withEnv(appConfigs.envs.withEmailLinks);
        await app.dev();
      });

      test.afterAll(async () => {
        await app.teardown();
      });

      test.describe('sign up using email-link', () => {
        test('click verification link on the same device results in both tabs being signed in', async ({
          page,
          context,
        }) => {
          await performSignUpVerificationLinkSameDevice(app, page, context);
        });

        test('sign up and click verification link on the same device with redirect_url set results in both tabs being signed in and redirected to redirect_url', async ({
          page,
          context,
        }) => {
          const params = new URLSearchParams({ redirect_url: '/protected' });
          await performSignUpVerificationLinkSameDevice(app, page, context, params);
          await page.waitForURL(/protected/);
        });

        test('click verification link on a different device results in the first device being signed in', async ({
          page,
          context,
          browser,
        }) => {
          await performSignUpVerificationLinkDifferentDevice(app, page, context, browser);
        });

        test('click verification link on a different device with redirect_url setresults in the first device being signed in and redirected to redirect_url', async ({
          page,
          context,
          browser,
        }) => {
          const params = new URLSearchParams({ redirect_url: '/protected' });
          await performSignUpVerificationLinkDifferentDevice(app, page, context, browser, params);
          await page.waitForURL(/protected/);
        });
      });

      test.describe('sign in using email-link', () => {
        test.skip('sign in using a verification link requested from the same device', async () => {
          // TODO: @george :D
        });

        test.skip('sign in using a verification link requested from a different device', async () => {
          // TODO: @george :D
        });
      });
    });
  });
});

const performSignUpVerificationLinkSameDevice = async (
  app: Application,
  page: Page,
  context: BrowserContext,
  searchParams?: URLSearchParams,
) => {
  const u = createTestUtils({ app, page, context });
  const fakeUser = u.services.users.createFakeUser();
  await u.po.signUp.goTo({ searchParams });
  await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
  await u.po.signUp.waitForEmailVerificationScreen();
  await u.tabs.runInNewTab(async u => {
    const verificationLink = await u.services.email.getVerificationLinkForEmailAddress(fakeUser.email);
    await u.page.goto(verificationLink);
    await u.po.expect.toBeSignedIn();
    await u.page.close();
  });
  await u.po.expect.toBeSignedIn();
  await fakeUser.deleteIfExists();
};

const performSignUpVerificationLinkDifferentDevice = async (
  app: Application,
  page: Page,
  context: BrowserContext,
  browser: Browser,
  searchParams?: URLSearchParams,
) => {
  const u = createTestUtils({ app, page, context, browser });
  const fakeUser = u.services.users.createFakeUser();
  await u.po.signUp.goTo({ searchParams });
  await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email, password: fakeUser.password });
  await u.po.signUp.waitForEmailVerificationScreen();
  await u.tabs.runInNewBrowser(async u => {
    const verificationLink = await u.services.email.getVerificationLinkForEmailAddress(fakeUser.email);
    await u.page.goto(verificationLink);
    await u.po.expect.toBeSignedOut();
    await u.page.pause();
    await u.page.getByText(/Return to original tab to continue/i).waitFor();
    await u.page.close();
  });
  await u.po.expect.toBeSignedIn();
  await fakeUser.deleteIfExists();
};
