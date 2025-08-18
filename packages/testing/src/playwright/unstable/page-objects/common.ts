import type { EnhancedPage } from './app';

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
    enterOtpCode: async (code: string, opts?: { name?: string }) => {
      const { name = 'Enter verification code' } = opts ?? {};

      const prepareVerificationPromise = page.waitForResponse('**/v1/client/sign_ups/*/prepare_verification**');
      const attemptVerificationPromise = page.waitForResponse('**/v1/client/sign_ups/*/attempt_verification**');

      await prepareVerificationPromise;
      await page.getByLabel(name).fill(code);
      await attemptVerificationPromise;
    },
    enterTestOtpCode: async () => {
      return self.enterOtpCode('424242');
    },
    // It's recommended to use .fill instead of .type
    // @see https://playwright.dev/docs/api/class-keyboard#keyboard-type
    fillTestOtpCode: async (name: string) => {
      return self.enterOtpCode('424242', { name });
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
