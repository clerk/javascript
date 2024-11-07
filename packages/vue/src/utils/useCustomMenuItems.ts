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

    // Action
    if (onClick || open) {
      customMenuItems.value.push({
        ...baseItem,
        onClick,
        open,
      });
      return;
    }

    // Link
    if (href) {
      customMenuItems.value.push({
        ...baseItem,
        href,
      });
    }
  }

  return {
    customMenuItems,
    customMenuItemsPortals,
    addCustomMenuItem,
  };
};
