import type { EnhancedPage } from './app';
import { common } from './common';

export const createAPIKeysComponentPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;
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
    typeName: (value: string) => {
      return page.getByLabel(/Secret key name/i).fill(value);
    },
    typeDescription: (value: string) => {
      return page.getByLabel(/Description/i).fill(value);
    },
    selectExpiration: (value: string) => {
      return page.getByLabel(/Expiration/i).selectOption(value);
    },
    clickSaveButton: () => {
      return page.getByText(/Create key/i).click();
    },
  };
  return self;
};
