export interface SSOBypassEntry {
  userId: string;
  name: string;
  identifier: string;
  username: string | undefined;
  imageUrl: string | undefined;
  isCurrentUser: boolean;
}

export type SSOBypassAddMode = 'email' | 'role';

export type SSOBypassSkipReason = 'domainNotServed' | 'notMember' | 'unknown';

export interface SSOBypassAddResult {
  mode: SSOBypassAddMode;
  added: number;
  skipped: number;
  skipReason: SSOBypassSkipReason;
}

export interface SSOBypassRole {
  key: string;
  name: string;
  memberCount: number | undefined;
}

export interface SSOBypassRoles {
  roles: SSOBypassRole[];
  isLoading: boolean;
  isError: boolean;
}

export interface SSOBypassAllowlistData {
  entries: SSOBypassEntry[];
  isLoading: boolean;
  isError: boolean;
}
