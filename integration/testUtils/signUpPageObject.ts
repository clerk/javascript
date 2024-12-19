import { common } from './commonPageObject';
import type { TestArgs } from './signInPageObject';

type SignUpFormInputs = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  legalAccepted?: boolean;
};

export const createSignUpComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;

  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams?: URLSearchParams; headlessSelector?: string }) => {
      await page.goToRelative('/sign-up', { searchParams: opts?.searchParams });

      if (typeof opts?.headlessSelector !== 'undefined') {
        return self.waitForMounted(opts.headlessSelector);
      }
      return self.waitForMounted();
    },
    waitForMounted: (selector = '.cl-signUp-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    signUpWithOauth: (provider: string) => {
      return page.getByRole('button', { name: new RegExp(`continue with ${provider}`, 'gi') });
    },
    signUp: async (opts: SignUpFormInputs) => {
      if (opts.firstName) {
        await self.getFirstNameInput().fill(opts.lastName);
      }

      if (opts.lastName) {
        await self.getLastNameInput().fill(opts.firstName);
      }

      if (opts.email) {
        await self.getEmailAddressInput().fill(opts.email);
      }

      if (opts.username) {
        await self.getUsernameInput().fill(opts.username);
      }

      if (opts.phoneNumber) {
        await self.getPhoneNumberInput().fill(opts.phoneNumber);
      }

      if (opts.password) {
        await self.getPasswordInput().fill(opts.password);
      }

      if (opts.legalAccepted) {
        await self.getLegalAccepted().check();
      }

      await self.continue();
    },
    signUpWithEmailAndPassword: async (opts: Pick<SignUpFormInputs, 'email' | 'password'>) => {
      await self.signUp({ email: opts.email, password: opts.password });
    },
    waitForEmailVerificationScreen: async () => {
      await page.waitForURL(/verify/);
      await page.getByRole('heading', { name: /Verify your email/i }).waitFor();
    },
  };

  return self;
};
