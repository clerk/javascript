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
    goTo: async (opts?: { searchParams?: URLSearchParams; headlessSelector?: string; timeout?: number }) => {
      const navRes = await page.goToRelative('/sign-in', opts);

      if (typeof opts?.headlessSelector !== 'undefined') {
        await self.waitForMounted(opts.headlessSelector);
      } else {
        await self.waitForMounted();
      }
      return navRes;
    },
    waitForMounted: (selector = '.cl-signIn-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    waitForModal: (state?: 'open' | 'closed') => {
      return page.waitForSelector('.cl-modalContent:has(.cl-signIn-root)', {
        state: state === 'closed' ? 'detached' : 'attached',
      });
    },
    setIdentifier: (val: string) => {
      return self.getIdentifierInput().fill(val);
    },
    setInstantPassword: async (val: string) => {
      const passField = self.getPasswordInput();
      await expect(passField).toBeVisible();
      await passField.fill(val, { force: true });
    },
    usePhoneNumberIdentifier: () => {
      return page.getByRole('link', { name: /^use phone/i });
    },
    useEmailIdentifier: () => {
      return page.getByRole('link', { name: /^use email/i });
    },
    useUsernameIdentifier: () => {
      return page.getByRole('link', { name: /^username$/i });
    },
    getForgotPassword: () => {
      return page.getByRole('link', { name: /forgot password/i });
    },
    getGoToSignUp: () => {
      return page.getByRole('link', { name: /sign up/i });
    },
    getResetPassword: () => {
      return page.getByRole('button', { name: /(reset password|reset your password)/i });
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
      const identifierField = self.getIdentifierInput();
      await expect(identifierField).toBeVisible();

      await identifierField.fill(opts.email);
      await self.setInstantPassword(opts.password);
      await self.continue();
    },
  };
  return self;
};
