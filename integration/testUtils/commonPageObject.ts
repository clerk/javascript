import type { TestArgs } from './signInPageObject';

export const common = ({ page }: TestArgs) => {
  const self = {
    continue: () => {
      return page.getByRole('button', { name: 'Continue', exact: true }).click();
    },
    setPassword: (val: string) => {
      return page.locator('input[name=password]').fill(val);
    },
    enterOtpCode: async (code: string) => {
      await page.getByRole('textbox', { name: /digit 1/i }).click();
      await page.keyboard.type(code, { delay: 50 });
    },
    enterTestOtpCode: async () => {
      return self.enterOtpCode('424242');
    },
    getIdentifierInput: () => {
      return page.locator('input[name=identifier]');
    },
    getEmailAddressInput: () => {
      return page.locator('input[name=emailAddress]');
    },
    getPasswordInput: () => {
      return page.locator('input[name=password]');
    },
    getFirstNameInput: () => {
      return page.locator('input[name=firstName]');
    },
    getLastNameInput: () => {
      return page.locator('input[name=lastName]');
    },
  };

  return self;
};
