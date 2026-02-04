import type { CustomPage } from '@clerk/shared/types';
import { logErrorInDevMode } from '@clerk/shared/utils';
import type { ReactElement } from 'react';
import React from 'react';

import {
  MenuItems,
  OrganizationProfileLink,
  OrganizationProfilePage,
  UserProfileLink,
  UserProfilePage,
} from '../components/uiComponents';
import { customLinkWrongProps, customPagesIgnoredComponent, customPageWrongProps } from '../errors/messages';
import type { UserProfilePageProps } from '../types';
import { isThatComponent } from './componentValidation';
import type { UseCustomElementPortalParams, UseCustomElementPortalReturn } from './useCustomElementPortal';
import { useCustomElementPortal } from './useCustomElementPortal';

export const useUserProfileCustomPages = (
  children: React.ReactNode | React.ReactNode[],
  options?: UseCustomPagesOptions,
) => {
  const reorderItemsLabels = ['account', 'security', 'billing', 'apiKeys'];
  return useCustomPages(
    {
      children,
      reorderItemsLabels,
      LinkComponent: UserProfileLink,
      PageComponent: UserProfilePage,
      MenuItemsComponent: MenuItems,
      componentName: 'UserProfile',
    },
    options,
  );
};

export const useOrganizationProfileCustomPages = (
  children: React.ReactNode | React.ReactNode[],
  options?: UseCustomPagesOptions,
) => {
  const reorderItemsLabels = ['general', 'members', 'billing', 'apiKeys'];
  return useCustomPages(
    {
      children,
      reorderItemsLabels,
      LinkComponent: OrganizationProfileLink,
      PageComponent: OrganizationProfilePage,
      componentName: 'OrganizationProfile',
    },
    options,
  );
};

type UseCustomPagesParams = {
  children: React.ReactNode | React.ReactNode[];
  LinkComponent: any;
  PageComponent: any;
  MenuItemsComponent?: any;
  reorderItemsLabels: string[];
  componentName: string;
};

type UseCustomPagesOptions = {
  allowForAnyChildren: boolean;
};

type CustomPageWithIdType = UserProfilePageProps & { children?: React.ReactNode };

/**
 * Exclude any children that is used for identifying Custom Pages or Custom Items.
 * Passing:
 * ```tsx
 *  <UserProfile.Page/>
 *  <OrganizationProfile.Link/>
 *  <MyComponent>
 *  <UserButton.MenuItems/>
 * ```
 * Gives back
 * ```tsx
 * <MyComponent>
 * ````
 */
export const useSanitizedChildren = (children: React.ReactNode) => {
  const sanitizedChildren: React.ReactNode[] = [];

  const excludedComponents: any[] = [
    OrganizationProfileLink,
    OrganizationProfilePage,
    MenuItems,
    UserProfilePage,
    UserProfileLink,
  ];

  React.Children.forEach(children, child => {
    if (!excludedComponents.some(component => isThatComponent(child, component))) {
      sanitizedChildren.push(child);
    }
  });

  return sanitizedChildren;
};

const useCustomPages = (params: UseCustomPagesParams, options?: UseCustomPagesOptions) => {
  const { children, LinkComponent, PageComponent, MenuItemsComponent, reorderItemsLabels, componentName } = params;
  const { allowForAnyChildren = false } = options || {};
  const validChildren: CustomPageWithIdType[] = [];

  React.Children.forEach(children, child => {
    if (
      !isThatComponent(child, PageComponent) &&
      !isThatComponent(child, LinkComponent) &&
      !isThatComponent(child, MenuItemsComponent)
    ) {
      if (child && !allowForAnyChildren) {
        logErrorInDevMode(customPagesIgnoredComponent(componentName));
      }
      return;
    }

    const { props } = child as ReactElement;

    const { children, label, url, labelIcon } = props;

    if (isThatComponent(child, PageComponent)) {
      if (isReorderItem(props, reorderItemsLabels)) {
        // This is a reordering item
        validChildren.push({ label });
      } else if (isCustomPage(props)) {
        // this is a custom page
        validChildren.push({ label, labelIcon, children, url });
      } else {
        logErrorInDevMode(customPageWrongProps(componentName));
        return;
      }
    }

    if (isThatComponent(child, LinkComponent)) {
      if (isExternalLink(props)) {
        // This is an external link
        validChildren.push({ label, labelIcon, url });
      } else {
        logErrorInDevMode(customLinkWrongProps(componentName));
        return;
      }
    }
  });

  const customPageContents: UseCustomElementPortalParams[] = [];
  const customPageLabelIcons: UseCustomElementPortalParams[] = [];
  const customLinkLabelIcons: UseCustomElementPortalParams[] = [];

  validChildren.forEach((cp, index) => {
    if (isCustomPage(cp)) {
      customPageContents.push({ component: cp.children, id: index });
      customPageLabelIcons.push({ component: cp.labelIcon, id: index });
      return;
    }
    if (isExternalLink(cp)) {
      customLinkLabelIcons.push({ component: cp.labelIcon, id: index });
    }
  });

  const customPageContentsPortals = useCustomElementPortal(customPageContents);
  const customPageLabelIconsPortals = useCustomElementPortal(customPageLabelIcons);
  const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);

  const customPages: CustomPage[] = [];
  const customPagesPortals: React.ComponentType[] = [];

  validChildren.forEach((cp, index) => {
    if (isReorderItem(cp, reorderItemsLabels)) {
      customPages.push({ label: cp.label });
      return;
    }
    if (isCustomPage(cp)) {
      const {
        portal: contentPortal,
        mount,
        unmount,
      } = customPageContentsPortals.find(p => p.id === index) as UseCustomElementPortalReturn;
      const {
        portal: labelPortal,
        mount: mountIcon,
        unmount: unmountIcon,
      } = customPageLabelIconsPortals.find(p => p.id === index) as UseCustomElementPortalReturn;
      customPages.push({ label: cp.label, url: cp.url, mount, unmount, mountIcon, unmountIcon });
      customPagesPortals.push(contentPortal);
      customPagesPortals.push(labelPortal);
      return;
    }
    if (isExternalLink(cp)) {
      const {
        portal: labelPortal,
        mount: mountIcon,
        unmount: unmountIcon,
      } = customLinkLabelIconsPortals.find(p => p.id === index) as UseCustomElementPortalReturn;
      customPages.push({ label: cp.label, url: cp.url, mountIcon, unmountIcon });
      customPagesPortals.push(labelPortal);
      return;
    }
  });

  return { customPages, customPagesPortals };
};

const isReorderItem = (childProps: any, validItems: string[]): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !url && !labelIcon && validItems.some(v => v === label);
};

const isCustomPage = (childProps: any): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !!children && !!url && !!labelIcon && !!label;
};

const isExternalLink = (childProps: any): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !!url && !!labelIcon && !!label;
};
