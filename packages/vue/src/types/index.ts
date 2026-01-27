// Re-export all shared types
export type * from '@clerk/shared/types';

// Vue-specific types
export type {
  VueClerkInjectionKeyType,
  CustomPortalsRendererProps,
  CustomItemOrPageWithoutHandler,
  AddCustomMenuItemParams,
  AddCustomPagesParams,
  UserProfilePageProps,
  UserProfileLinkProps,
  OrganizationProfilePageProps,
  OrganizationLinkProps,
  UserButtonActionProps,
  UserButtonLinkProps,
} from '../types';

// Plugin types
export type { PluginOptions } from '../plugin';
