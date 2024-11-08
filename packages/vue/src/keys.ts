import type { InjectionKey } from 'vue';

import type {
  AddCustomMenuItemParams,
  AddOrganizationProfileCustomPagesParams,
  AddUserProfileCustomPagesParams,
  VueClerkInjectionKeyType,
} from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonInjectionKey = Symbol('UserButtonRoot') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;

export const UserButtonMenuItemsInjectionKey = Symbol('UserButtonMenuItems') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;

export const UserProfileInjectionKey = Symbol('UserProfile') as InjectionKey<{
  addCustomPage(params: AddUserProfileCustomPagesParams): void;
}>;

export const OrganizationProfileInjectionKey = Symbol('OrganizationProfile') as InjectionKey<{
  addCustomPage(params: AddOrganizationProfileCustomPagesParams): void;
}>;
