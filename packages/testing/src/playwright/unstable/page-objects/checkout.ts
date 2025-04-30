import type { EnhancedPage } from './app';
import { common } from './common';

export const createCheckoutPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-checkout-root') => {
      return page.waitForSelector(selector, { state: 'attached' });
    },
    fillTestCard: async () => {
      await self.fillCard({
        number: '4242424242424242',
        expiration: '1234',
        cvc: '123',
        country: 'United States',
        zip: '12345',
      });
    },
    fillCard: async (card: { number: string; expiration: string; cvc: string; country: string; zip: string }) => {
      const frame = page.frameLocator('iframe[src*="elements-inner-payment"]');
      await frame.getByLabel('Card number').fill(card.number);
      await frame.getByLabel('Expiration date').fill(card.expiration);
      await frame.getByLabel('Security code').fill(card.cvc);
      await frame.getByLabel('Country').selectOption(card.country);
      await frame.getByLabel('ZIP code').fill(card.zip);
    },
    continueWithSavedCard: async () => {
      await page
        .locator('.cl-disclosureRoot')
        .filter({ has: page.getByRole('button', { name: 'Payment Methods' }) })
        .getByRole('button', { name: /subscribe|pay\s/i })
        .click();
    },
    clickAddNewPaymentMethod: async () => {
      await page.getByRole('button', { name: 'Add new payment method' }).click();
    },
    continueWithNewCard: async () => {
      await page
        .locator('.cl-formContainer')
        .filter({ has: page.getByRole('heading', { name: 'Add new payment method' }) })
        .getByRole('button', { name: /subscribe|pay\s/i })
        .click();
    },
  };
  return self;
};
