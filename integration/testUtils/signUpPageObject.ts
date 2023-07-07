import { common } from './commonPageObject';
import type { TestArgs } from './signInPageObject';

export const createSignUpComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/sign-up', opts);
      return self.waitForMounted();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-signUp-root', { state: 'attached' });
    },
    signUpWithOauth: (provider: string) => {
      return page.getByRole('button', { name: new RegExp(`continue with ${provider}`, 'gi') });
    },
    signUpWithEmailAndPassword: async (opts: { email: string; password: string }) => {
      await self.getEmailAddressInput().fill(opts.email);
      await self.setPassword(opts.password);
      await self.continue();
    },
    waitForEmailVerificationScreen: async () => {
      await page.waitForURL(/verify/);
      await page.getByRole('heading', { name: /Verify your email/i }).waitFor();
    },
  };

  return self;
};
