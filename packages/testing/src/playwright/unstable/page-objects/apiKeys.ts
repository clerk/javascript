import type { EnhancedPage } from './app';
import { common } from './common';

export const createAPIKeysComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const expirationOptions = {
    never: 'Never',
    '1d': '1 Day',
    '7d': '7 Days',
    '30d': '30 Days',
    '60d': '60 Days',
    '90d': '90 Days',
    '180d': '180 Days',
    '1y': '1 Year',
  } as const;

  const self = {
    ...common(testArgs),
    waitForMounted: () => {
      return page.waitForSelector('.cl-apiKeys-root', { state: 'attached' });
    },
    clickAddButton: () => {
      return page.getByText(/Add new key/i).click();
    },
    waitForFormOpened: () => {
      return page.waitForSelector('.cl-apiKeysCreateForm', { state: 'attached' });
    },
    waitForFormClosed: () => {
      return page.waitForSelector('.cl-apiKeysCreateForm', { state: 'detached' });
    },
    waitForRevokeModalOpened: () => {
      return page.waitForSelector('.cl-apiKeysRevokeModal', { state: 'attached' });
    },
    waitForRevokeModalClosed: () => {
      return page.waitForSelector('.cl-apiKeysRevokeModal', { state: 'detached' });
    },
    waitForCopyModalOpened: () => {
      return page.waitForSelector('.cl-apiKeysCopyModal', { state: 'attached' });
    },
    waitForCopyModalClosed: () => {
      return page.waitForSelector('.cl-apiKeysCopyModal', { state: 'detached' });
    },
    clickCopyAndCloseButton: () => {
      return page.locator('.cl-apiKeysCopyModal .cl-apiKeysCopyModalSubmitButton').click();
    },
    typeName: (value: string) => {
      return page.getByLabel(/Secret key name/i).fill(value);
    },
    typeDescription: (value: string) => {
      return page.getByLabel(/Description/i).fill(value);
    },
    selectExpiration: async (value?: keyof typeof expirationOptions) => {
      await page.getByRole('button', { name: /Select date/i }).click();
      return page.getByText(expirationOptions[value ?? 'never'], { exact: true }).click({ force: true });
    },
    clickSaveButton: () => {
      return page.getByText(/Create key/i).click();
    },
    typeRevokeConfirmation: (value: string) => {
      return page.getByLabel(/Type "Revoke" to confirm/i).fill(value);
    },
    clickConfirmRevokeButton: () => {
      return page.getByText(/Revoke key/i).click();
    },
  };
  return self;
};
