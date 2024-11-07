import type { CustomMenuItem } from '@clerk/types';
import type { Slot } from 'vue';
import { ref } from 'vue';

import type { MenuItemWithoutMountHandlers } from '../types';

export const useCustomMenuItems = () => {
  const customMenuItems = ref<CustomMenuItem[]>([]);
  const customMenuItemsPortals = ref(new Map<HTMLDivElement, Slot>());
  const reorderItemsLabels = ['manageAccount', 'signOut'];

  function addCustomMenuItem(item: MenuItemWithoutMountHandlers, iconSlot: Slot | undefined) {
    // Reorder item
    if (reorderItemsLabels.includes(item.label)) {
      customMenuItems.value.push({ label: item.label });
      return;
    }

    if (!iconSlot) {
      throw new Error('Icon slot is required');
    }

    const baseItem: CustomMenuItem = {
      label: item.label,
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
    if (item.onClick || item.open) {
      customMenuItems.value.push({
        ...baseItem,
        onClick: item.onClick,
        open: item.open,
      });
      return;
    }

    // Link
    if (item.href) {
      customMenuItems.value.push({
        ...baseItem,
        href: item.href,
      });
    }
  }

  return {
    customMenuItems,
    customMenuItemsPortals,
    addCustomMenuItem,
  };
};
