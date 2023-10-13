import type { Page } from '@playwright/test';

import type { Application } from '../models/application';

export const createAppPageObject = (testArgs: { page: Page }, app: Application) => {
  const { page } = testArgs;
  const appPage = Object.create(page) as Page;
  const helpers = {
    goToStart: async () => {
      try {
        await page.goto(app.serverUrl);
      } catch (e) {
        // do not fail the test if interstitial is returned (401)
      }
    },
    goToRelative: async (path: string, opts: { searchParams?: URLSearchParams } = {}) => {
      const url = new URL(path, app.serverUrl);
      if (opts.searchParams) {
        url.search = opts.searchParams.toString();
      }
      await page.goto(url.toString(), { timeout: 10000 });
    },
    goToSignIn: (searchParams: URLSearchParams) => {
      return helpers.goToRelative('/sign-in', { searchParams });
    },
    goToSignUp: (searchParams: URLSearchParams) => {
      return helpers.goToRelative('/sign-up', { searchParams });
    },
    goToUserProfile: () => {
      return helpers.goToRelative('/user');
    },
    waitForClerkJsLoaded: async () => {
      return page.waitForFunction(() => {
        // @ts-ignore
        return window.Clerk?.isReady();
      });
    },
    waitForClerkComponentMounted: async () => {
      return page.waitForSelector('.cl-rootBox', { state: 'attached' });
    },
  };
  return Object.assign(appPage, helpers);
};
