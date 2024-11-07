import type { InjectionKey, Slot } from 'vue';

import type { MenuItemWithoutMountHandlers, VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonRootKey = Symbol('UserButtonRoot') as InjectionKey<{
  addCustomMenuItem(item: MenuItemWithoutMountHandlers, iconSlot: Slot | undefined): void;
}>;

export const UserButtonMenuItemsKey = Symbol('UserButtonMenuItems') as InjectionKey<{
  addCustomMenuItem(item: MenuItemWithoutMountHandlers, iconSlot: Slot | undefined): void;
}>;
