import type { Browser, BrowserContext } from '@playwright/test';

import type { createAppPageObject } from './appPageObject';
import { common } from './commonPageObject';

export type EnchancedPage = ReturnType<typeof createAppPageObject>;
export type TestArgs = { page: EnchancedPage; context: BrowserContext; browser: Browser };

export type Sections = 'organizationProfile' | 'organizationDomains' | 'organizationDanger';

export const createOrganizationProfileComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;
  const self = {
    ...common(testArgs),
    goTo: async (opts?: { searchParams: URLSearchParams }) => {
      await page.goToRelative('/organization', opts);
      return self.waitForMounted();
    },
    waitForMounted: () => {
      return page.waitForSelector('.cl-organizationProfile-root', { state: 'attached' });
    },
    waitToBeUnMounted: () => {
      return page.waitForSelector('.cl-organizationProfile-root', { state: 'detached' });
    },
    waitForOrganizationProfileModal: () => {
      return page.waitForSelector('.cl-modalContent > .cl-organizationProfile-root', { state: 'visible' });
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
    clickUpdateProfile: () => {
      return page.getByText(/update profile/i).click();
    },
    clickDeleteOrganization: () => {
      return page
        .getByRole('button', {
          name: /delete organization/i,
        })
        .click();
    },
    clickLeaveOrganization: () => {
      return page
        .getByRole('button', {
          name: /leave organization/i,
        })
        .click();
    },
    typeOrganizationName: (value: string) => {
      return self.getOrganizationNameInput().fill(value);
    },
    typeOrganizationSlug: (value: string) => {
      return self.getOrganizationSlugInput().fill(value);
    },
    clickSave: () => {
      return page.getByText(/save/i).click();
    },
    typeConfirmationMessage: (value: string) => {
      return self.getDeleteOrganizationConfirmationInput().fill(value);
    },
  };
  return self;
};
