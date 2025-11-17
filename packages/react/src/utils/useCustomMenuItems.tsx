import type { CustomMenuItem } from '@clerk/shared/types';
import { logErrorInDevMode } from '@clerk/shared/utils';
import type { ReactElement } from 'react';
import React from 'react';

import { MenuAction, MenuItems, MenuLink, UserProfileLink, UserProfilePage } from '../components/uiComponents';
import {
  customMenuItemsIgnoredComponent,
  userButtonIgnoredComponent,
  userButtonMenuItemLinkWrongProps,
  userButtonMenuItemsActionWrongsProps,
} from '../errors/messages';
import type { UserButtonActionProps, UserButtonLinkProps } from '../types';
import { isThatComponent } from './componentValidation';
import type { UseCustomElementPortalParams, UseCustomElementPortalReturn } from './useCustomElementPortal';
import { useCustomElementPortal } from './useCustomElementPortal';

export const useUserButtonCustomMenuItems = (
  children: React.ReactNode | React.ReactNode[],
  options?: { allowForAnyChildren?: boolean },
) => {
  const reorderItemsLabels = ['manageAccount', 'signOut'];
  return useCustomMenuItems({
    children,
    reorderItemsLabels,
    MenuItemsComponent: MenuItems,
    MenuActionComponent: MenuAction,
    MenuLinkComponent: MenuLink,
    UserProfileLinkComponent: UserProfileLink,
    UserProfilePageComponent: UserProfilePage,
    allowForAnyChildren: options?.allowForAnyChildren ?? false,
  });
};

type UseCustomMenuItemsParams = {
  children: React.ReactNode | React.ReactNode[];
  MenuItemsComponent?: any;
  MenuActionComponent?: any;
  MenuLinkComponent?: any;
  UserProfileLinkComponent?: any;
  UserProfilePageComponent?: any;
  reorderItemsLabels: string[];
  allowForAnyChildren?: boolean;
};

type CustomMenuItemType = UserButtonActionProps | UserButtonLinkProps;

const useCustomMenuItems = ({
  children,
  MenuItemsComponent,
  MenuActionComponent,
  MenuLinkComponent,
  UserProfileLinkComponent,
  UserProfilePageComponent,
  reorderItemsLabels,
  allowForAnyChildren = false,
}: UseCustomMenuItemsParams) => {
  const validChildren: CustomMenuItemType[] = [];
  const customMenuItems: CustomMenuItem[] = [];
  const customMenuItemsPortals: React.ComponentType[] = [];

  React.Children.forEach(children, child => {
    if (
      !isThatComponent(child, MenuItemsComponent) &&
      !isThatComponent(child, UserProfileLinkComponent) &&
      !isThatComponent(child, UserProfilePageComponent)
    ) {
      if (child && !allowForAnyChildren) {
        logErrorInDevMode(userButtonIgnoredComponent);
      }
      return;
    }

    // Ignore UserProfileLinkComponent and UserProfilePageComponent
    if (isThatComponent(child, UserProfileLinkComponent) || isThatComponent(child, UserProfilePageComponent)) {
      return;
    }

    // Menu items children
    const { props } = child as ReactElement;

    React.Children.forEach(props.children, child => {
      if (!isThatComponent(child, MenuActionComponent) && !isThatComponent(child, MenuLinkComponent)) {
        if (child) {
          logErrorInDevMode(customMenuItemsIgnoredComponent);
        }

        return;
      }

      const { props } = child as ReactElement;

      const { label, labelIcon, href, onClick, open } = props;

      if (isThatComponent(child, MenuActionComponent)) {
        if (isReorderItem(props, reorderItemsLabels)) {
          // This is a reordering item
          validChildren.push({ label });
        } else if (isCustomMenuItem(props)) {
          const baseItem = {
            label,
            labelIcon,
          };

          if (onClick !== undefined) {
            validChildren.push({
              ...baseItem,
              onClick,
            });
          } else if (open !== undefined) {
            validChildren.push({
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

      if (isThatComponent(child, MenuLinkComponent)) {
        if (isExternalLink(props)) {
          validChildren.push({ label, labelIcon, href });
        } else {
          logErrorInDevMode(userButtonMenuItemLinkWrongProps);
          return;
        }
      }
    });
  });

  const customMenuItemLabelIcons: UseCustomElementPortalParams[] = [];
  const customLinkLabelIcons: UseCustomElementPortalParams[] = [];
  validChildren.forEach((mi, index) => {
    if (isCustomMenuItem(mi)) {
      customMenuItemLabelIcons.push({ component: mi.labelIcon, id: index });
    }
    if (isExternalLink(mi)) {
      customLinkLabelIcons.push({ component: mi.labelIcon, id: index });
    }
  });

  const customMenuItemLabelIconsPortals = useCustomElementPortal(customMenuItemLabelIcons);
  const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);

  validChildren.forEach((mi, index) => {
    if (isReorderItem(mi, reorderItemsLabels)) {
      customMenuItems.push({
        label: mi.label,
      });
    }
    if (isCustomMenuItem(mi)) {
      const {
        portal: iconPortal,
        mount: mountIcon,
        unmount: unmountIcon,
      } = customMenuItemLabelIconsPortals.find(p => p.id === index) as UseCustomElementPortalReturn;
      const menuItem: CustomMenuItem = {
        label: mi.label,
        mountIcon,
        unmountIcon,
      };

      if ('onClick' in mi) {
        menuItem.onClick = mi.onClick;
      } else if ('open' in mi) {
        menuItem.open = mi.open;
      }
      customMenuItems.push(menuItem);
      customMenuItemsPortals.push(iconPortal);
    }
    if (isExternalLink(mi)) {
      const {
        portal: iconPortal,
        mount: mountIcon,
        unmount: unmountIcon,
      } = customLinkLabelIconsPortals.find(p => p.id === index) as UseCustomElementPortalReturn;
      customMenuItems.push({
        label: mi.label,
        href: mi.href,
        mountIcon,
        unmountIcon,
      });
      customMenuItemsPortals.push(iconPortal);
    }
  });

  return { customMenuItems, customMenuItemsPortals };
};

const isReorderItem = (childProps: any, validItems: string[]): boolean => {
  const { children, label, onClick, labelIcon } = childProps;
  return !children && !onClick && !labelIcon && validItems.some(v => v === label);
};

const isCustomMenuItem = (childProps: any): childProps is UserButtonActionProps => {
  const { label, labelIcon, onClick, open } = childProps;
  return !!labelIcon && !!label && (typeof onClick === 'function' || typeof open === 'string');
};

const isExternalLink = (childProps: any): childProps is UserButtonLinkProps => {
  const { label, href, labelIcon } = childProps;
  return !!href && !!labelIcon && !!label;
};
