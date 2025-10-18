import type { CustomMenuItem, LoadedClerk } from '@clerk/shared/types';

import { USER_BUTTON_ITEM_ID } from '../constants';
import type { LocalizationKey } from '../customizables';
import { CogFilled, SignOut } from '../icons';
import { localizationKeys } from '../localization';
import { ExternalElementMounter } from './ExternalElementMounter';
import { isDevelopmentSDK } from './runtimeEnvironment';
import { sanitizeCustomLinkURL } from './sanitizeCustomLinkURL';

export type DefaultItemIds = 'manageAccount' | 'addAccount' | 'signOut' | 'signOutAll';

export type MenuItem = {
  id: string;
  name: LocalizationKey | string;
  icon: React.ComponentType;
  onClick?: () => void;
  open?: string;
  path?: string;
};

type MenuReorderItem = {
  label: 'manageAccount' | 'signOut';
};

type CustomMenuAction = {
  label: string;
  onClick: () => void;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type CustomMenuActionWithOpen = {
  label: string;
  open: string;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type CustomMenuLink = {
  label: string;
  href: string;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
};

type CreateCustomMenuItemsParams = {
  customMenuItems: CustomMenuItem[];
  getDefaultMenuItems: () => { INITIAL_MENU_ITEMS: MenuItem[]; validReorderItemLabels: string[] };
};

export const createUserButtonCustomMenuItems = (customMenuItems: CustomMenuItem[], clerk: LoadedClerk) => {
  return createCustomMenuItems({ customMenuItems, getDefaultMenuItems: getUserButtonDefaultMenuItems }, clerk);
};

const createCustomMenuItems = (
  { customMenuItems, getDefaultMenuItems }: CreateCustomMenuItemsParams,
  clerk: LoadedClerk,
) => {
  const { INITIAL_MENU_ITEMS, validReorderItemLabels } = getDefaultMenuItems();

  const validCustomMenuItems = customMenuItems.filter(item => {
    if (!isValidCustomMenuItem(item, validReorderItemLabels)) {
      if (isDevelopmentSDK(clerk)) {
        console.error('Clerk: Invalid custom menu item:', item);
      }
      return false;
    }
    return true;
  });

  if (isDevelopmentSDK(clerk)) {
    checkForDuplicateUsageOfReorderingItems(customMenuItems, validReorderItemLabels);
    warnForDuplicateLabels(validCustomMenuItems);
  }

  const { menuItems } = getMenuItems({ customMenuItems: validCustomMenuItems, defaultMenuItems: INITIAL_MENU_ITEMS });

  return menuItems;
};

const getMenuItems = ({
  customMenuItems,
  defaultMenuItems,
}: {
  customMenuItems: CustomMenuItem[];
  defaultMenuItems: MenuItem[];
}) => {
  let remainingDefaultItems: MenuItem[] = defaultMenuItems.map(r => r);

  const items: MenuItem[] = customMenuItems.map((ci: CustomMenuItem, index) => {
    if (isCustomMenuLink(ci)) {
      return {
        name: ci.label,
        id: `custom-menutItem-${index}`,
        icon: props => (
          <ExternalElementMounter
            mount={ci.mountIcon}
            unmount={ci.unmountIcon}
            {...props}
          />
        ),
        path: sanitizeCustomLinkURL(ci.href),
      };
    }

    if (isCustomMenuItem(ci)) {
      return {
        name: ci.label,
        id: `custom-menutItem-${index}`,
        icon: props => (
          <ExternalElementMounter
            mount={ci.mountIcon}
            unmount={ci.unmountIcon}
            {...props}
          />
        ),
        onClick: ci?.onClick,
      };
    }

    if (isCustomMenuItemWithOpen(ci)) {
      return {
        name: ci.label,
        id: `custom-menutItem-${index}`,
        icon: props => (
          <ExternalElementMounter
            mount={ci.mountIcon}
            unmount={ci.unmountIcon}
            {...props}
          />
        ),
        open: ci.open,
      };
    }

    const reorderItem = defaultMenuItems.find(item => item.id === ci.label) as MenuItem;
    remainingDefaultItems = remainingDefaultItems.filter(item => item.id !== ci.label);

    return { ...reorderItem };
  });

  const allItems = [...items, ...remainingDefaultItems];

  const hasReorderedManageAccount = customMenuItems.some(item => item.label === USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT);
  // Ensure that the "Manage account" item is always at the top of the list if it's not included in the custom items
  if (!hasReorderedManageAccount) {
    allItems.sort(a => {
      if (a.id === USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT) {
        return -1;
      }
      return 0;
    });
  }

  return { menuItems: allItems };
};

const getUserButtonDefaultMenuItems = () => {
  const INITIAL_MENU_ITEMS = [
    {
      name: localizationKeys('userButton.action__manageAccount'),
      id: USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT as 'manageAccount',
      icon: CogFilled as React.ComponentType,
    },
    {
      name: localizationKeys('userButton.action__signOut'),
      id: USER_BUTTON_ITEM_ID.SIGN_OUT as 'signOut',
      icon: SignOut as React.ComponentType,
    },
  ];

  const validReorderItemLabels: string[] = INITIAL_MENU_ITEMS.map(r => r.id);

  return { INITIAL_MENU_ITEMS, validReorderItemLabels };
};

const isValidCustomMenuItem = (item: CustomMenuItem, validReorderItemLabels: string[]): item is CustomMenuItem => {
  return (
    (isCustomMenuLink(item) ||
      isCustomMenuItem(item) ||
      isCustomMenuItemWithOpen(item) ||
      isReorderItem(item, validReorderItemLabels)) &&
    typeof item.label === 'string'
  );
};

const isCustomMenuItem = (ci: CustomMenuItem): ci is CustomMenuAction => {
  return !!ci.label && !!ci.onClick && !ci.mount && !ci.unmount && !!ci.mountIcon && !!ci.unmountIcon;
};

const isCustomMenuItemWithOpen = (ci: CustomMenuItem): ci is CustomMenuActionWithOpen => {
  return !!ci.label && !!ci.open && !ci.mount && !ci.unmount && !!ci.mountIcon && !!ci.unmountIcon;
};

const isCustomMenuLink = (ci: CustomMenuItem): ci is CustomMenuLink => {
  return !!ci.href && !!ci.label && !ci.mount && !ci.unmount && !!ci.mountIcon && !!ci.unmountIcon;
};

const isReorderItem = (ci: CustomMenuItem, validItems: string[]): ci is MenuReorderItem => {
  return !ci.mount && !ci.unmount && !ci.mountIcon && !ci.unmountIcon && validItems.some(v => v === ci.label);
};

const checkForDuplicateUsageOfReorderingItems = (customMenuItems: CustomMenuItem[], validReorderItems: string[]) => {
  const reorderItems = customMenuItems.filter(ci => isReorderItem(ci, validReorderItems));
  reorderItems.reduce((acc, ci) => {
    if (acc.includes(ci.label)) {
      console.error(
        `Clerk: The "${ci.label}" item is used more than once when reordering pages. This may cause unexpected behavior.`,
      );
    }
    return [...acc, ci.label];
  }, [] as string[]);
};

const warnForDuplicateLabels = (items: CustomMenuItem[]) => {
  const labels = items.map(item => item.label);
  const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index);
  if (duplicates.length > 0) {
    console.warn(`Clerk: Duplicate custom menu item labels found: ${duplicates.join(', ')}`);
  }
};
