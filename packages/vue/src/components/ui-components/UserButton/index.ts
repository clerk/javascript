import { defineComponent, inject, provide } from 'vue';

import { errorThrower } from '../../../errors/errorThrower';
import {
  userButtonMenuActionRenderedError,
  userButtonMenuItemsRenderedError,
  userButtonMenuLinkRenderedError,
} from '../../../errors/messages';
import { UserButtonInjectionKey, UserButtonMenuItemsInjectionKey } from '../../../keys';
import type { UserButtonActionProps, UserButtonLinkProps } from '../../../types';
import { UserProfileLink, UserProfilePage } from '../UserProfile';
import _UserButton from './UserButton.vue';

const MenuItems = defineComponent((_, { slots }) => {
  const ctx = inject(UserButtonInjectionKey);

  if (!ctx) {
    return errorThrower.throw(userButtonMenuItemsRenderedError);
  }

  provide(UserButtonMenuItemsInjectionKey, ctx);
  return () => slots.default?.();
});

export const MenuAction = defineComponent(
  (props: UserButtonActionProps, { slots }) => {
    const ctx = inject(UserButtonMenuItemsInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userButtonMenuActionRenderedError);
    }

    ctx.addCustomMenuItem({
      props,
      slots,
      component: MenuAction,
    });

    return () => null;
  },
  { name: 'MenuAction' },
);

export const MenuLink = defineComponent(
  (props: UserButtonLinkProps, { slots }) => {
    const ctx = inject(UserButtonMenuItemsInjectionKey);
    if (!ctx) {
      return errorThrower.throw(userButtonMenuLinkRenderedError);
    }

    ctx.addCustomMenuItem({
      props,
      slots,
      component: MenuLink,
    });

    return () => null;
  },
  { name: 'MenuLink' },
);

export const UserButton = Object.assign(_UserButton, {
  MenuItems,
  Action: MenuAction,
  Link: MenuLink,
  UserProfilePage,
  UserProfileLink,
});
