import type { CustomPage } from '@clerk/shared/types';
import { logErrorInDevMode } from '@clerk/shared/utils';
import type { Component } from 'vue';
import { ref } from 'vue';

import { OrganizationProfileLink, OrganizationProfilePage } from '../components/ui-components/OrganizationProfile';
import { UserProfileLink, UserProfilePage } from '../components/ui-components/UserProfile';
import { customLinkWrongProps, customPageWrongProps } from '../errors/messages';
import type { AddCustomPagesParams } from '../types';
import { isThatComponent } from './componentValidation';
import { useCustomElementPortal } from './useCustomElementPortal';

export const useUserProfileCustomPages = () => {
  const { customPages, customPagesPortals, addCustomPage } = useCustomPages({
    reorderItemsLabels: ['account', 'security', 'billing', 'apiKeys'],
    PageComponent: UserProfilePage,
    LinkComponent: UserProfileLink,
    componentName: 'UserProfile',
  });

  const addUserProfileCustomPage = (params: AddCustomPagesParams) => {
    return addCustomPage(params);
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage: addUserProfileCustomPage,
  };
};

export const useOrganizationProfileCustomPages = () => {
  const { customPages, customPagesPortals, addCustomPage } = useCustomPages({
    reorderItemsLabels: ['general', 'members', 'billing', 'apiKeys'],
    PageComponent: OrganizationProfilePage,
    LinkComponent: OrganizationProfileLink,
    componentName: 'OrganizationProfile',
  });

  const addOrganizationProfileCustomPage = (params: AddCustomPagesParams) => {
    return addCustomPage(params);
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage: addOrganizationProfileCustomPage,
  };
};

type UseCustomPagesParams = {
  LinkComponent: Component;
  PageComponent: Component;
  reorderItemsLabels: string[];
  componentName: string;
};

export const useCustomPages = (customPagesParams: UseCustomPagesParams) => {
  const customPages = ref<CustomPage[]>([]);
  const { portals: customPagesPortals, mount, unmount } = useCustomElementPortal();
  const { PageComponent, LinkComponent, reorderItemsLabels, componentName } = customPagesParams;

  const addCustomPage = (params: AddCustomPagesParams) => {
    const { props, slots, component } = params;
    const { label, url } = props;

    if (isThatComponent(component, PageComponent)) {
      if (isReorderItem(props, slots, reorderItemsLabels)) {
        // This is a reordering item
        customPages.value.push({ label });
      } else if (isCustomPage(props, slots)) {
        // This is a custom page
        customPages.value.push({
          label,
          url,
          mountIcon(el) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mount(el, slots.labelIcon!);
          },
          unmountIcon: unmount,
          mount(el) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mount(el, slots.default!);
          },
          unmount,
        });
      } else {
        logErrorInDevMode(customPageWrongProps(componentName));
        return;
      }
    }

    if (isThatComponent(component, LinkComponent)) {
      if (isExternalLink(props, slots)) {
        // This is an external link
        customPages.value.push({
          label,
          url,
          mountIcon(el) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mount(el, slots.labelIcon!);
          },
          unmountIcon: unmount,
        });
      } else {
        logErrorInDevMode(customLinkWrongProps(componentName));
        return;
      }
    }
  };

  return {
    customPages,
    customPagesPortals,
    addCustomPage,
  };
};

const isReorderItem = (props: any, slots: AddCustomPagesParams['slots'], validItems: string[]): boolean => {
  const { label, url } = props;
  const { default: defaultSlot, labelIcon } = slots;
  return !defaultSlot && !url && !labelIcon && validItems.some(v => v === label);
};

const isCustomPage = (props: any, slots: AddCustomPagesParams['slots']): boolean => {
  const { label, url } = props;
  const { default: defaultSlot, labelIcon } = slots;
  return !!defaultSlot && !!url && !!labelIcon && !!label;
};

const isExternalLink = (props: any, slots: AddCustomPagesParams['slots']): boolean => {
  const { label, url } = props;
  const { default: defaultSlot, labelIcon } = slots;
  return !defaultSlot && !!url && !!labelIcon && !!label;
};
