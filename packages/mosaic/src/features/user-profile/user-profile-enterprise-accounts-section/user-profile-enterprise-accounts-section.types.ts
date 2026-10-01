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

export type EnterpriseAccountActionResult = 'redirecting' | void;

export class EnterpriseAccountActionError extends Error {
  constructor(readonly code: 'unavailable' | 'missing_verification_url') {
    super(code);
    this.name = 'EnterpriseAccountActionError';
  }
}
