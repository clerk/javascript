import { expect } from '@playwright/test';

import type { EnhancedPage } from './app';

/**
 * The Mosaic UserButton renders no `data-testid` and no component-scoped classnames, so everything
 * here goes through roles and accessible names. The popup and every menu portal out of the trigger's
 * tree, which is why they are queried from the page rather than from within the trigger.
 */
export const createMosaicUserButtonPageObject = (testArgs: { page: EnhancedPage }) => {
  const { page } = testArgs;

  const trigger = () => page.getByRole('button', { name: /^Open account menu for / });
  // Exact, because clerk-js labels the legacy popover "Account panel" and role names match on substring.
  const popup = () => page.getByRole('dialog', { name: 'Account', exact: true });

  const self = {
    trigger,
    popup,
    waitForMounted: () => trigger().waitFor({ state: 'attached' }),
    toggleTrigger: () => trigger().click(),
    waitForPopover: () => popup().waitFor({ state: 'visible' }),
    waitForPopoverClosed: () => popup().waitFor({ state: 'detached' }),
    expectTriggerLabel: (workspaceName: string) => {
      return expect(trigger()).toHaveAccessibleName(`Open account menu for ${workspaceName}`);
    },
    /** Switches to an organization by the name it lists. */
    selectWorkspace: (name: string) => popup().getByRole('button', { name, exact: true }).click(),
    selectPersonalWorkspace: () => popup().getByRole('button', { name: 'Personal account', exact: true }).click(),
    /** Switches to another signed-in account, which lists by its identifier. */
    switchAccount: (identifier: string) => popup().getByRole('button', { name: identifier, exact: true }).click(),
    /** The `⋯` on an account row, holding manage-account, create-organization, and sign-out. */
    openAccountActions: (identifier: string) => {
      return popup()
        .getByRole('button', { name: `Actions for ${identifier}` })
        .click();
    },
    /** The `⋯` beside the "Accounts" heading, holding add-account. */
    openAccountsHeadingActions: () => popup().getByRole('button', { name: 'Account actions' }).click(),
    clickMenuItem: (name: string) => page.getByRole('menuitem', { name, exact: true }).click(),
    /** Header and foot actions alike; each name appears once in the popup. */
    clickAction: (name: string) => popup().getByRole('button', { name, exact: true }).click(),
    /** Manage account is only reachable through the account row's actions menu. */
    triggerManageAccount: async (identifier: string) => {
      await self.openAccountActions(identifier);
      await self.clickMenuItem('Manage account');
    },
    triggerManageOrganization: () => self.clickAction('Manage organization'),
    triggerSignOutAll: () => self.clickAction('Sign out of all accounts'),
  };

  return self;
};
