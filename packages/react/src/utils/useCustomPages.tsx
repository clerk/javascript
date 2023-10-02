import { isDevelopmentEnvironment } from '@clerk/shared';
import type { CustomPage } from '@clerk/types';
import type { ReactElement } from 'react';
import React from 'react';

import { UserProfileLink, UserProfilePage } from '../components/uiComponents';
import { customPagesIngoredComponent, userProfileLinkWrongProps, userProfilePageWrongProps } from '../errors';
import type { UserProfilePageProps } from '../types';
import type { UseCustomElementPortalParams, UseCustomElementPortalReturn } from './useCustomElementPortal';
import { useCustomElementPortal } from './useCustomElementPortal';

const errorInDevMode = (message: string) => {
  if (isDevelopmentEnvironment()) {
    console.error(message);
  }
};

const isPageComponent = (v: any): v is React.ReactNode => {
  return !!v && React.isValidElement(v) && (v as React.ReactElement)?.type === UserProfilePage;
};

const isLinkComponent = (v: any): v is React.ReactNode => {
  return !!v && React.isValidElement(v) && (v as React.ReactElement)?.type === UserProfileLink;
};

type CustomPageWithIdType = UserProfilePageProps & { children?: React.ReactNode };

export const useCustomPages = (userProfileChildren: React.ReactNode | React.ReactNode[]) => {
  const validUserProfileChildren: CustomPageWithIdType[] = [];

  React.Children.forEach(userProfileChildren, child => {
    if (!isPageComponent(child) && !isLinkComponent(child)) {
      if (child) {
        errorInDevMode(customPagesIngoredComponent);
      }
      return;
    }

    const { props } = child as ReactElement;

    const { children, label, url, labelIcon } = props;

    if (isPageComponent(child)) {
      if (isReorderItem(props)) {
        // This is a reordering item
        validUserProfileChildren.push({ label });
      } else if (isCustomPage(props)) {
        // this is a custom page
        validUserProfileChildren.push({ label, labelIcon, children, url });
      } else {
        errorInDevMode(userProfilePageWrongProps);
        return;
      }
    }

    if (isLinkComponent(child)) {
      if (isExternalLink(props)) {
        // This is an external link
        validUserProfileChildren.push({ label, labelIcon, url });
      } else {
        errorInDevMode(userProfileLinkWrongProps);
        return;
      }
    }
  });

  const customPageContents: UseCustomElementPortalParams[] = [];
  const customPageLabelIcons: UseCustomElementPortalParams[] = [];
  const customLinkLabelIcons: UseCustomElementPortalParams[] = [];

  validUserProfileChildren.forEach((cp, index) => {
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

  validUserProfileChildren.forEach((cp, index) => {
    if (isReorderItem(cp)) {
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

const isReorderItem = (childProps: any): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !url && !labelIcon && (label === 'account' || label === 'security');
};

const isCustomPage = (childProps: any): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !!children && !!url && !!labelIcon && !!label;
};

const isExternalLink = (childProps: any): boolean => {
  const { children, label, url, labelIcon } = childProps;
  return !children && !!url && !!labelIcon && !!label;
};
