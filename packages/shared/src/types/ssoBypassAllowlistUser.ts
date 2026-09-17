import type { PublicUserDataJSON } from './json';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';

export interface SsoBypassAllowlistUserJSON {
  object: 'sso_bypass_allowlist_user';
  user_id: string;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export type SsoBypassAllowlistUserJSONSnapshot = SsoBypassAllowlistUserJSON;

export interface SsoBypassAllowlistUserResource extends ClerkResource {
  id: string;
  userId: string;
  publicUserData: PublicUserData;
  createdAt: Date;
  updatedAt: Date;
  __internal_toSnapshot: () => SsoBypassAllowlistUserJSONSnapshot;
}

export type AddSsoBypassAllowlistUserParams = {
  userId: string;
};
