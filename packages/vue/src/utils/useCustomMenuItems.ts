import type { CustomMenuItem } from '@clerk/shared/types';
import { logErrorInDevMode } from '@clerk/shared/utils';
import { ref } from 'vue';

import { MenuAction, MenuLink } from '../components/ui-components/UserButton';
import { userButtonMenuItemActionWrongProps, userButtonMenuItemLinkWrongProps } from '../errors/messages';
import type { AddCustomMenuItemParams, UserButtonActionProps, UserButtonLinkProps } from '../types';
import { isThatComponent } from './componentValidation';
import { useCustomElementPortal } from './useCustomElementPortal';

export const useUserButtonCustomMenuItems = () => {
  const customMenuItems = ref<CustomMenuItem[]>([]);
  const { portals: customMenuItemsPortals, mount, unmount } = useCustomElementPortal();
  const reorderItemsLabels = ['manageAccount', 'signOut'];

  function addCustomMenuItem(params: AddCustomMenuItemParams) {
    const { props, component, slots } = params;
    const { label, onClick, open, href } = props;

    if (isThatComponent(component, MenuAction)) {
      if (isReorderItem(props, slots, reorderItemsLabels)) {
        // This is a reordering item
        customMenuItems.value.push({ label });
      } else if (isCustomMenuItem(props, slots)) {
        const baseItem: CustomMenuItem = {
          label,
          mountIcon(el) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mount(el, slots.labelIcon!);
          },
          unmountIcon: unmount,
        };

        if (onClick !== undefined) {
          customMenuItems.value.push({
            ...baseItem,
            onClick,
            open,
          });
        } else if (open !== undefined) {
          customMenuItems.value.push({
            ...baseItem,
            open: open.startsWith('/') ? open : `/${open}`,
          });
        } else {
          // Handle the case where neither onClick nor open is defined
          logErrorInDevMode('Custom menu item must have either onClick or open property');
          return;
        }
      } else {
        logErrorInDevMode(userButtonMenuItemActionWrongProps);
        return;
      }
    }

    if (isThatComponent(component, MenuLink)) {
      if (isExternalLink(props, slots)) {
        customMenuItems.value.push({
          label,
          href,
          mountIcon(el) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mount(el, slots.labelIcon!);
          },
          unmountIcon: unmount,
        });
      } else {
        logErrorInDevMode(userButtonMenuItemLinkWrongProps);
        return;
      }
    }
  }

  return {
    customMenuItems,
    customMenuItemsPortals,
    addCustomMenuItem,
  };
};

const isReorderItem = (props: any, slots: AddCustomMenuItemParams['slots'], validItems: string[]): boolean => {
  const { label, onClick } = props;
  const { labelIcon } = slots;
  return !onClick && !labelIcon && validItems.some(v => v === label);
};

const isCustomMenuItem = (props: any, slots: AddCustomMenuItemParams['slots']): props is UserButtonActionProps => {
  const { label, onClick, open } = props;
  const { labelIcon } = slots;
  return !!labelIcon && !!label && (typeof onClick === 'function' || typeof open === 'string');
};

const isExternalLink = (props: any, slots: AddCustomMenuItemParams['slots']): props is UserButtonLinkProps => {
  const { label, href } = props;
  const { labelIcon } = slots;
  return !!href && !!labelIcon && !!label;
};
