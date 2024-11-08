import { logErrorInDevMode } from '@clerk/shared/utils';
import type { CustomMenuItem } from '@clerk/types';
import type { Slot } from 'vue';
import { ref } from 'vue';

import { MenuAction, MenuLink } from '../components/uiComponents';
import { userButtonMenuItemLinkWrongProps, userButtonMenuItemsActionWrongsProps } from '../errors/messages';
import type { AddCustomMenuItemParams, UserButtonActionProps, UserButtonLinkProps } from '../types';
import { isThatComponent } from './componentValidation';

export const useUserButtonCustomMenuItems = () => {
  const customMenuItems = ref<CustomMenuItem[]>([]);
  const customMenuItemsPortals = ref(new Map<HTMLDivElement, Slot>());
  const reorderItemsLabels = ['manageAccount', 'signOut'];

  function addCustomMenuItem(params: AddCustomMenuItemParams) {
    const { props, component, iconSlot } = params;
    const { label, onClick, open, href } = props;

    if (isThatComponent(component, MenuAction)) {
      if (isReorderItem(props, iconSlot, reorderItemsLabels)) {
        // This is a reordering item
        customMenuItems.value.push({ label });
      } else if (isCustomMenuItem(props, iconSlot)) {
        const baseItem: CustomMenuItem = {
          label,
          mountIcon(el) {
            customMenuItemsPortals.value.set(el, iconSlot!);
          },
          unmountIcon(el) {
            if (el) {
              customMenuItemsPortals.value.delete(el);
            }
          },
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
        logErrorInDevMode(userButtonMenuItemsActionWrongsProps);
        return;
      }
    }

    if (isThatComponent(component, MenuLink)) {
      if (isExternalLink(props, iconSlot)) {
        customMenuItems.value.push({
          label,
          href,
          mountIcon(el) {
            customMenuItemsPortals.value.set(el, iconSlot!);
          },
          unmountIcon(el) {
            if (el) {
              customMenuItemsPortals.value.delete(el);
            }
          },
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

const isReorderItem = (props: any, iconSlot: Slot | undefined, validItems: string[]): boolean => {
  const { label, onClick } = props;
  return !onClick && !iconSlot && validItems.some(v => v === label);
};

const isCustomMenuItem = (props: any, iconSlot: Slot | undefined): props is UserButtonActionProps => {
  const { label, onClick, open } = props;
  return !!iconSlot && !!label && (typeof onClick === 'function' || typeof open === 'string');
};

const isExternalLink = (props: any, iconSlot: Slot | undefined): props is UserButtonLinkProps => {
  const { label, href } = props;
  return !!href && !!iconSlot && !!label;
};
