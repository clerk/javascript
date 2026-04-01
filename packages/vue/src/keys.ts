import type { InjectionKey } from 'vue';

import type { AddCustomMenuItemParams, AddCustomPagesParams, VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;

export const UserButtonInjectionKey = Symbol('UserButton') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;

export const UserButtonMenuItemsInjectionKey = Symbol('UserButton.MenuItems') as InjectionKey<{
  addCustomMenuItem(params: AddCustomMenuItemParams): void;
}>;

export const UserProfileInjectionKey = Symbol('UserProfile') as InjectionKey<{
  addCustomPage(params: AddCustomPagesParams): void;
}>;

export const OrganizationProfileInjectionKey = Symbol('OrganizationProfile') as InjectionKey<{
  addCustomPage(params: AddCustomPagesParams): void;
}>;

export const PortalInjectionKey = Symbol('Portal') as InjectionKey<{
  getContainer: () => HTMLElement | null;
}>;
