export interface UserProfileEnterpriseConnection {
  id: string;
  name: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
  connectError?: string;
}

export interface UserProfileEnterpriseAccount extends UserProfileEnterpriseConnection {
  emailAddress?: string;
  requiresAction?: boolean;
}

export type EnterpriseAccountActionResult = 'redirecting' | void;
