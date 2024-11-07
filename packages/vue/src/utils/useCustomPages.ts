import type { CustomPage, Without } from '@clerk/types';
import { ref, type Slot } from 'vue';

import type { AddCustomPagesParams, AddUserProfileCustomPagesParams } from '../types';

export const useUserProfileCustomPages = () => {
  const { customPages, customPagesPortals, addCustomPage } = useCustomPages();
  const reorderItemsLabels = ['account', 'security'];

  const addUserProfileCustomPage = (params: AddUserProfileCustomPagesParams) => {
    return addCustomPage({
      reorderItemsLabels,
      ...params,
    });
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage: addUserProfileCustomPage,
  };
};

export const useOrganizationProfileCustomPages = () => {
  const { customPages, customPagesPortals, addCustomPage } = useCustomPages();
  const reorderItemsLabels = ['general', 'members'];

  const addOrganizationProfileCustomPage = (params: Without<AddCustomPagesParams, 'reorderItemsLabels'>) => {
    return addCustomPage({
      reorderItemsLabels,
      ...params,
    });
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage: addOrganizationProfileCustomPage,
  };
};

export const useCustomPages = () => {
  const customPages = ref<CustomPage[]>([]);
  const customPagesPortals = ref(new Map<HTMLDivElement, Slot>());

  const addCustomPage = (params: AddCustomPagesParams) => {
    const { reorderItemsLabels, customPage, defaultSlot, iconSlot } = params;
    const { label, url } = customPage;

    if (reorderItemsLabels.includes(label)) {
      customPages.value.push({ label });
      return;
    }

    if (!defaultSlot) {
      throw new Error('Default slot is required');
    }

    if (!iconSlot) {
      throw new Error('Icon slot is required');
    }

    const baseItem: CustomPage = {
      label,
      mountIcon(el) {
        customPagesPortals.value.set(el, iconSlot);
      },
      unmountIcon(el) {
        if (el) {
          customPagesPortals.value.delete(el);
        }
      },
      mount(el) {
        customPagesPortals.value.set(el, defaultSlot);
      },
      unmount(el) {
        if (el) {
          customPagesPortals.value.delete(el);
        }
      },
    };

    if (!url) {
      throw new Error('URL is required');
    }

    if (url) {
      customPages.value.push({
        ...baseItem,
        url,
      });
    }
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage,
  };
};
