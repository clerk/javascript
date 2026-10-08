import { useEffect, useRef } from 'react';

import { USER_BUTTON_ITEM_ID } from '../../constants';
import type { MenuItem } from '../../utils/createCustomMenuItems';
import type { SessionActionHandlers, SessionActionsData, SessionActionsModel } from './session-actions.types';

export const useSessionActionsController = (
  handlers: SessionActionHandlers,
  model: SessionActionsModel,
): SessionActionsData => {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () => mounted.current && handlers.canRun();
  const { navigate, menuItems } = model;

  return {
    menuItems,
    hasOnlyDefaultItems: menuItems.every((item: MenuItem) => Object.values(USER_BUTTON_ITEM_ID).includes(item.id)),
    onMenuItemClick: async (menuItem: MenuItem) => {
      if (!canRun()) {
        return false;
      }
      if (menuItem?.path) {
        await navigate(menuItem.path);
        if (canRun()) {
          handlers.completedCallback();
        }
        return;
      }
      if (menuItem.id === USER_BUTTON_ITEM_ID.MANAGE_ACCOUNT) {
        return await handlers.handleManageAccountClicked();
      }
      if (menuItem?.open) {
        return handlers.handleUserProfileActionClicked(menuItem.open);
      }
      menuItem.onClick?.();
      if (canRun()) {
        handlers.completedCallback();
      }
    },
  };
};
