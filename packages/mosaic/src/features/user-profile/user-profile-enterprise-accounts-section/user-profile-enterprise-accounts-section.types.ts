export interface UserProfileEnterpriseConnection {
  id: string;
  name: string;
  iconUrl?: string;
  connectError?: string;
}

export interface UserProfileEnterpriseAccount extends UserProfileEnterpriseConnection {
  emailAddress?: string;
  requiresAction?: boolean;
}
