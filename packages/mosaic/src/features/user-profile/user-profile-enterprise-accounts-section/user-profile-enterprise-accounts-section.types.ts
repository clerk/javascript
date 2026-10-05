import type { UserProfileProviderIconProps } from '../user-profile-provider-icon';

export interface UserProfileEnterpriseConnection {
  id: string;
  name: string;
  icon: UserProfileProviderIconProps;
  connectError?: string;
}

export interface UserProfileEnterpriseAccount extends UserProfileEnterpriseConnection {
  emailAddress?: string;
  requiresAction?: boolean;
}

export type EnterpriseAccountActionResult = 'redirecting' | void;
