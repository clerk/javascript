export interface AuthProvider {
  id: string;
  name: string;
  iconUrl: string;
}

export interface AuthActionBlockedDetails {
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  traceId?: string;
}

export type AuthEmailLinkStatusValue =
  | 'loading'
  | 'signed-in'
  | 'signed-in-other-tab'
  | 'transferable'
  | 'expired'
  | 'failed'
  | 'client-mismatch';
