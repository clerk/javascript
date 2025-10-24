import type { EnhancedPage } from './app';
import { common } from './common';

export const createCheckoutPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    waitForMounted: (selector = '.cl-checkout-root') => {
      return page.waitForSelector(selector, { state: 'attached', timeout: 20000 });
    },
    closeDrawer: () => {
      return page.locator('.cl-drawerClose').click();
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
      await self.waitForStripeElements({ state: 'visible' });
      const frame = page.frameLocator('iframe[src*="elements-inner-payment"]');
      await frame.getByLabel('Card number').fill(card.number);
      await frame.getByLabel('Expiration date').fill(card.expiration);
      await frame.getByLabel('Security code').fill(card.cvc);
      await frame.getByLabel('Country').selectOption(card.country);
      await frame.getByLabel('ZIP code').fill(card.zip);
    },
    waitForStripeElements: async ({ state = 'visible' }: { state?: 'visible' | 'hidden' } = {}) => {
      const iframe = page.locator('iframe[src*="elements-inner-payment"]');
      if (state === 'visible') {
        await iframe.waitFor({ state: 'attached', timeout: 20000 });
        await page.frameLocator('iframe[src*="elements-inner-payment"]').getByLabel('Card number').waitFor({
          state: 'visible',
          timeout: 20000,
        });
      } else {
        await page.frameLocator('iframe[src*="elements-inner-payment"]').getByLabel('Card number').waitFor({
          state: 'hidden',
          timeout: 20000,
        });
      }
    },
    clickPayOrSubscribe: async () => {
      await self.root.getByRole('button', { name: /subscribe|pay\s\$|start/i }).click();
    },
    waitForSubscribeButton: async () => {
      await self.root.getByRole('button', { name: /^subscribe$/i }).waitFor({ state: 'visible' });
    },
    confirmAndContinue: async () => {
      await self.root.getByRole('button', { name: /^continue$/i }).click();
    },
    clickAddPaymentMethod: async () => {
      await self.root.getByRole('radio', { name: 'Add payment method' }).click();
    },
    clickPaymentMethods: async () => {
      await self.root.getByRole('radio', { name: 'Payment Methods' }).click();
    },
    root: page.locator('.cl-checkout-root'),
  };
  return self;
};
