import type { InjectionKey } from 'vue';

import type { AddCustomMenuItemParams, AddUserProfileCustomPagesParams, VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonInjectionKey = Symbol('UserButtonRoot') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
  addCustomPage(params: AddUserProfileCustomPagesParams): void;
}>;

export const UserButtonMenuItemsInjectionKey = Symbol('UserButtonMenuItems') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;
