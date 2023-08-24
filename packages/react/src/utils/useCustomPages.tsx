import { isDevelopmentEnvironment } from '@clerk/shared';
import type { CustomPage } from '@clerk/types';
import type { ReactElement } from 'react';
import React from 'react';

import { UserProfileLink, UserProfilePage } from '../components/uiComponents';
import { customPagesIngoredComponent, userProfileLinkWrongProps, userProfilePageWrongProps } from '../errors';
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

export const useCustomPages = (userProfileChildren: React.ReactNode | React.ReactNode[]) => {
  const customPages: CustomPage[] = [];
  const customPagesPortals: React.ComponentType[] = [];
  React.Children.forEach(userProfileChildren, child => {
    if (!isPageComponent(child) && !isLinkComponent(child)) {
      errorInDevMode(customPagesIngoredComponent);
      return;
    }

    const { props } = child as ReactElement;

    const { children, label, url, labelIcon } = props;

    if (isPageComponent(child)) {
      if (isReorderItem(props)) {
        // This is a reordering item
        customPages.push({ label });
      } else if (isCustomPage(props)) {
        // this is a custom page
        const { CustomElementPortal, mount, unmount } = useCustomElementPortal(children);
        const {
          CustomElementPortal: labelPortal,
          mount: mountIcon,
          unmount: unmountIcon,
        } = useCustomElementPortal(labelIcon);
        customPages.push({
          url,
          label,
          mountIcon,
          unmountIcon,
          mount,
          unmount,
        });
        customPagesPortals.push(CustomElementPortal);
        customPagesPortals.push(labelPortal);
      } else {
        errorInDevMode(userProfilePageWrongProps);
        return;
      }
    }

    if (isLinkComponent(child)) {
      if (isExternalLink(props)) {
        // This is an external link
        const {
          CustomElementPortal: labelPortal,
          mount: mountIcon,
          unmount: unmountIcon,
        } = useCustomElementPortal(labelIcon);
        customPages.push({ label, url, mountIcon, unmountIcon });
        customPagesPortals.push(labelPortal);
      } else {
        errorInDevMode(userProfileLinkWrongProps);
        return;
      }
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
