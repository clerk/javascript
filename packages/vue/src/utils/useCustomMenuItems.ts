import type { CustomMenuItem } from '@clerk/types';
import type { Slot } from 'vue';
import { ref } from 'vue';

import type { AddCustomMenuItemParams } from '../types';

export const useUserButtonCustomMenuItems = () => {
  const customMenuItems = ref<CustomMenuItem[]>([]);
  const customMenuItemsPortals = ref(new Map<HTMLDivElement, Slot>());
  const reorderItemsLabels = ['manageAccount', 'signOut'];

  function addCustomMenuItem(params: AddCustomMenuItemParams) {
    const { customMenuItem, iconSlot } = params;
    const { label, onClick, open, href } = customMenuItem;

    // Reorder item
    if (reorderItemsLabels.includes(label)) {
      customMenuItems.value.push({ label });
      return;
    }

    if (!iconSlot) {
      throw new Error('Icon slot is required');
    }

    const baseItem: CustomMenuItem = {
      label,
      mountIcon(el) {
        customMenuItemsPortals.value.set(el, iconSlot);
      },
      unmountIcon(el) {
        if (el) {
          customMenuItemsPortals.value.delete(el);
        }
      },
    };

    if (onClick) {
      // Action
      customMenuItems.value.push({
        ...baseItem,
        onClick,
        open,
      });
    } else if (open) {
      // Action with custom page
      customMenuItems.value.push({
        ...baseItem,
        open: open.startsWith('/') ? open : `/${open}`,
      });
    } else if (href) {
      // Link
      customMenuItems.value.push({
        ...baseItem,
        href,
      });
    } else {
      throw new Error('Invalid custom menu item');
    }
  }

  return {
    customMenuItems,
    customMenuItemsPortals,
    addCustomMenuItem,
  };
};
