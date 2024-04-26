import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';
import { common } from './commonPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export type Sections = 'profile' | 'emailAddresses' | 'username' | 'phoneNumbers';

export const createUserProfileComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/user', opts);
      return self.waitForMounted();
    },
    switchToSecurityTab: async () => {
      await page.getByText(/Security/i).click();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-userProfile-root', { state: 'attached' });
    },
    clickSetUsername: () => {
      return page.getByText(/Set username/i).click();
    },
    clickUpdateUsername: () => {
      return page.getByText(/update username/i).click();
    },
    clickSetPassword: () => {
      return page.getByText(/Set password/i).click();
    },
    waitForSectionCard: (section: Sections, opened: boolean) => {
      return page.waitForSelector(`.cl-profileSectionContent__${section} .cl-headerTitle`, {
        state: opened ? 'visible' : 'detached',
      });
    },
    waitForSectionCardOpened: (section: Sections) => {
      return self.waitForSectionCard(section, true);
    },
    waitForSectionCardClosed: (section: Sections) => {
      return self.waitForSectionCard(section, false);
    },
    typeUsername: (value: string) => {
      return page.getByLabel(/username/i).fill(value);
    },
    typePhoneNumber: (value: string) => {
      return page.locator('#phoneNumber-field').fill(value);
    },
    clickAddEmailAddress: () => {
      return page.getByText(/add email address/i).click();
    },
    clickAddPhoneNumber: () => {
      return page.getByText(/add phone number/i).click();
    },
    typeEmailAddress: (value: string) => {
      return page.getByLabel(/Email address/i).fill(value);
    },
    waitForUserProfileModal: () => {
      return page.waitForSelector('.cl-modalContent > .cl-userProfile-root', { state: 'visible' });
    },
  };
  return self;
};
