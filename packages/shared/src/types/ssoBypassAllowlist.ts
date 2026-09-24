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

export type AddSSOBypassAllowlistUsersParams = {
  userIds: string[];
};

export interface SSOBypassAllowlistBulkCreateErrorJSON {
  user_id: string;
  code: string;
}

export interface SSOBypassAllowlistBulkCreateJSON {
  data: SSOBypassAllowlistUserJSON[];
  errors: SSOBypassAllowlistBulkCreateErrorJSON[];
}

export interface SSOBypassAllowlistBulkCreateError {
  userId: string;
  code: string;
}

export interface SSOBypassAllowlistBulkCreateResult {
  data: SSOBypassAllowlistUserResource[];
  errors: SSOBypassAllowlistBulkCreateError[];
}

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
   * Adds several members to the allowlist, one request per 100 ids. Members who cannot be added are reported in
   * `errors` with the same code `addUser` returns for them, and do not fail the batch.
   */
  addUsers: (params: AddSSOBypassAllowlistUsersParams) => Promise<SSOBypassAllowlistBulkCreateResult>;
  /**
   * Removes a member from the allowlist.
   */
  removeUser: (userId: string) => Promise<DeletedObjectResource>;
}
