import type { Browser, BrowserContext } from '@playwright/test';
import { expect } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';
import { common } from './commonPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export const createSignInComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/sign-in', opts);
      return self.waitForMounted();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-signIn-root', { state: 'attached' });
    },
    setIdentifier: (val: string) => {
      return self.getIdentifierInput().fill(val);
    },
    setInstantPassword: async (val: string) => {
      const passField = self.getPasswordInput();
      await passField.fill(val, { force: true });
      await expect(passField).toBeVisible();
    },
    getGoToSignUp: () => {
      return page.getByRole('link', { name: /sign up/i });
    },
    getUseAnotherMethodLink: () => {
      return page.getByRole('link', { name: /use another method/i });
    },
    getAltMethodsEmailCodeButton: () => {
      return page.getByRole('button', { name: /email code to/i });
    },
    getAltMethodsEmailLinkButton: () => {
      return page.getByRole('button', { name: /email link to/i });
    },
    signInWithOauth: (provider: string) => {
      return page.getByRole('button', { name: new RegExp(`continue with ${provider}`, 'gi') });
    },
    signInWithEmailAndInstantPassword: async (opts: { email: string; password: string }) => {
      await self.getIdentifierInput().fill(opts.email);
      await self.setInstantPassword(opts.password);
      await self.continue();
    },
  };
  return self;
};
