import type { InjectionKey } from 'vue';

import type { AddCustomMenuItemParams, VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonInjectionKey = Symbol('UserButton') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;

export const UserButtonMenuItemsInjectionKey = Symbol('UserButton.MenuItems') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;
