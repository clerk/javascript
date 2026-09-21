import type { DeletedObjectResource } from './deletedObject';
import type { PublicUserDataJSON } from './json';
import type { PublicUserData } from './session';

export interface SSOBypassAllowlistUserJSON {
  object: 'sso_bypass_allowlist_user';
  user_id: string;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export type SSOBypassAllowlistUserJSONSnapshot = SSOBypassAllowlistUserJSON;

export interface SSOBypassAllowlistUserResource {
  id: string;
  userId: string;
  publicUserData: PublicUserData;
  createdAt: Date;
  updatedAt: Date;
  __internal_toSnapshot: () => SSOBypassAllowlistUserJSONSnapshot;
}

export type AddSSOBypassAllowlistUserParams = {
  userId: string;
};

export interface SSOBypassAllowlistResource {
  /**
   * Lists the members who may sign in with an email code when the organization's enterprise SSO is unavailable.
   * Requires the `org:sys_entconns_sso_bypass:manage` permission.
   */
  getUsers: () => Promise<SSOBypassAllowlistUserResource[]>;
  /**
   * Adds a member to the allowlist. The member must hold a verified email address served by one of the
   * organization's enterprise connections.
   */
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<SSOBypassAllowlistUserResource>;
  /**
   * Removes a member from the allowlist.
   */
  removeUser: (userId: string) => Promise<DeletedObjectResource>;
}
