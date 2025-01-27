import type { Page } from '@playwright/test';

import type { Application } from '../models/application';

export const createAppPageObject = (testArgs: { page: Page }, app: Application) => {
  const { page } = testArgs;
  const appPage = Object.create(page) as Page;
  const helpers = {
    goToAppHome: async () => {
      try {
        await page.goto(app.serverUrl);
      } catch {
        // do not fail the test if interstitial is returned (401)
      }
    },
    goToRelative: (path: string, opts: { waitUntil?: any; searchParams?: URLSearchParams; timeout?: number } = {}) => {
      let url: URL;

      try {
        // When testing applications using real domains we want to manually navigate to the domain first
        // and not follow serverUrl (localhost) by default, as this is usually proxied
        if (page.url().includes('about:blank')) {
          url = new URL(path, app.serverUrl);
        } else {
          url = new URL(path, page.url());
        }
      } catch {
        // However, in most tests we don't need to manually navigate to the domain
        // as the test is using a localhost app directly
        // This handles the case where the page is at about:blank
        // and instead it uses the serverUrl
        url = new URL(path, app.serverUrl);
      }

      if (opts.searchParams) {
        url.search = opts.searchParams.toString();
      }
      return page.goto(url.toString(), { timeout: opts.timeout ?? 20000, waitUntil: opts.waitUntil });
    },
    waitForClerkJsLoaded: async () => {
      return page.waitForFunction(() => {
        return window.Clerk?.loaded;
      });
    },
    signOut: async () => {
      return page.waitForFunction(() => {
        return window.Clerk?.signOut({});
      });
    },
    waitForClerkComponentMounted: async () => {
      return page.waitForSelector('.cl-rootBox', { state: 'attached' });
    },
    waitForAppUrl: async (relativePath: string) => {
      return page.waitForURL(new URL(relativePath, app.serverUrl).toString());
    },
    /**
     * Get the cookies for the URL the page is currently at.
     * Suffixed cookies can be accessed by using the wildcard character `*` at the end of the cookie name,
     * eg `get('__session')` and `get('__session_*')`.
     */
    cookies: async () => {
      const array = await page.context().cookies();
      const map = array.reduce((acc, cookie) => {
        // If a suffixed cookie is found, we usually don't care about the suffix itself
        // Instead, simply replace the suffix with _* so we can easily read it
        // TODO: deal with collisions if neede
        // TODO: might be too much magic here
        // Maybe extract this into a different helper?
        if (cookie.name.match(/^(__.*_)(.{8})$/)) {
          acc.set(cookie.name.replace(/^(__.*_)(.{8})$/, '$1*'), cookie);
        } else {
          acc.set(cookie.name, cookie);
        }
        return acc;
      }, new Map<string, (typeof array)[number]>());
      return Object.assign(map, { raw: () => array });
    },
  };
  return Object.assign(appPage, helpers);
};
