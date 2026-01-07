import type { EnhancedPage } from './app';

type EnterOtpCodeOptions = {
  name?: string;
  awaitRequests?: boolean;
  awaitPrepare?: boolean;
  awaitAttempt?: boolean;
};

export const common = ({ page }: { page: EnhancedPage }) => {
  const self = {
    continue: () => {
      return page.getByRole('button', { name: 'Continue', exact: true }).click();
    },
    setEmailAddress: (val: string) => {
      return self.getEmailAddressInput().fill(val);
    },
    setPassword: (val: string) => {
      return self.getPasswordInput().fill(val);
    },
    setPasswordConfirmation: (val: string) => {
      return page.locator('input[name=confirmPassword]').fill(val);
    },
    enterOtpCode: async (code: string, opts?: EnterOtpCodeOptions) => {
      const {
        name = 'Enter verification code',
        awaitAttempt = true,
        awaitPrepare = true,
        awaitRequests = true,
      } = opts ?? {};

      if (awaitRequests && awaitPrepare) {
        const prepareVerificationPromise = page.waitForResponse(
          response =>
            response.request().method() === 'POST' &&
            (response.url().includes('prepare_verification') ||
              response.url().includes('prepare_first_factor') ||
              response.url().includes('prepare_second_factor')),
        );
        await prepareVerificationPromise;
      }

      // Handle the case for both OTP input versions
      const originalInput = page.getByRole('textbox', { name: 'Enter verification code. Digit 1' });
      if (await originalInput.isVisible()) {
        console.warn('Using the original OTP input');
        await originalInput.click();
        await page.keyboard.type(code, { delay: 100 });
      } else {
        await page.getByLabel(name).fill(code);
      }

      if (awaitRequests && awaitAttempt) {
        const attemptVerificationPromise = page.waitForResponse(
          response =>
            response.request().method() === 'POST' &&
            (response.url().includes('attempt_verification') ||
              response.url().includes('attempt_first_factor') ||
              response.url().includes('attempt_second_factor')),
        );
        await attemptVerificationPromise;
      }
    },
    enterTestOtpCode: async (opts?: EnterOtpCodeOptions) => {
      return self.enterOtpCode('424242', opts);
    },
    // @deprecated Use .enterTestOtpCode({ name: '...' }) instead
    fillTestOtpCode: async (name: string, opts?: Omit<EnterOtpCodeOptions, 'name'>) => {
      return self.enterOtpCode('424242', { name, ...opts });
    },
    getIdentifierInput: () => {
      return page.locator('input[name=identifier]');
    },
    getEmailAddressInput: () => {
      return page.locator('input[name=emailAddress]');
    },
    getPhoneNumberInput: () => {
      return page.locator('input[name=phoneNumber]');
    },
    getUsernameInput: () => {
      return page.locator('input[name=username]');
    },
    getPasswordInput: () => {
      return page.locator('input[name=password]');
    },
    getLegalAccepted: () => {
      return page.locator('input[name=legalAccepted]');
    },
    getFirstNameInput: () => {
      return page.locator('input[name=firstName]');
    },
    getLastNameInput: () => {
      return page.locator('input[name=lastName]');
    },
    waitForSession: async () => {
      return page.waitForFunction(() => {
        return !!window.Clerk?.session;
      });
    },
  };

  return self;
};
