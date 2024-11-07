import type { InjectionKey } from 'vue';

import type { AddCustomMenuItemParams, AddUserProfileCustomPagesParams, VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonRootKey = Symbol('UserButtonRoot') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
  addCustomPage(params: AddUserProfileCustomPagesParams): void;
}>;

export const UserButtonMenuItemsKey = Symbol('UserButtonMenuItems') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;
