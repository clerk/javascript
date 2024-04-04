import { common } from './commonPageObject';
import type { TestArgs } from './signInPageObject';

type SignUpFormInputs = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
};

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
