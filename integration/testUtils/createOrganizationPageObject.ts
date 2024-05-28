import type { TestArgs } from './signInPageObject';

export const createOrganizationCreateComponentPageObject = (testArgs: TestArgs) => {
  const { page } = testArgs;

  const self = {
    waitForMounted: () => {
      return page.waitForSelector('.cl-createOrganization-root', { state: 'attached' });
    },
    setOrganizationName: (val: string) => {
      return page.locator('input[name=name]').fill(val);
    },
    createOrganization: () => {
      return page.getByRole('button', { name: 'Create organization', exact: true }).click();
    },
  };

  return self;
};
