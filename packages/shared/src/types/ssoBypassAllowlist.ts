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
  /** The ID of the Organization member to add. */
  userId: string;
};

export type AddSSOBypassAllowlistUsersParams = {
  /** The IDs of the Organization members to add. */
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
  /** The ID of the member who could not be added. */
  userId: string;
  /** The error code explaining why the member could not be added. */
  code: string;
}

export interface SSOBypassAllowlistBulkCreateResult {
  /** The allowlist entries created successfully. */
  data: SSOBypassAllowlistUserResource[];
  /** The members who could not be added, each with a user ID and error code. */
  errors: SSOBypassAllowlistBulkCreateError[];
}

/**
 * The `SSOBypassAllowlistResource` object manages which Organization members can sign in with an email code instead of
 * using their enterprise single sign-on (SSO) connection. Access it through `organization.ssoBypassAllowlist` on the
 * [`Organization` object](https://clerk.com/docs/reference/objects/organization#ssobypassallowlist).
 *
 * Managing the allowlist requires the `org:sys_entconns_sso_bypass:manage` [System Permission](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#system-permissions).
 *
 * @interface
 */
export interface SSOBypassAllowlistResource {
  /**
   * Lists the Organization members on the SSO bypass allowlist.
   *
   * @returns An array of `SSOBypassAllowlistUserResource` objects.
   */
  getUsers: () => Promise<SSOBypassAllowlistUserResource[]>;
  /**
   * Adds an Organization member to the allowlist. The member must have a verified email address on a domain served by
   * one of the Organization's enterprise connections.
   *
   * @param params - An object with the `userId` of the Organization member to add.
   * @returns The new `SSOBypassAllowlistUserResource` object.
   */
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<SSOBypassAllowlistUserResource>;
  /**
   * Adds Organization members to the allowlist in batches of 100. Members who cannot be added appear in `errors` with
   * their `userId` and an error `code`; they do not prevent eligible members from being added to `data`.
   *
   * @param params - An object with the `userIds` of the Organization members to add.
   * @returns An object with successfully added allowlist entries in `data` and rejected members in `errors`.
   */
  addUsers: (params: AddSSOBypassAllowlistUsersParams) => Promise<SSOBypassAllowlistBulkCreateResult>;
  /**
   * Removes an Organization member from the allowlist.
   *
   * @param userId - The ID of the Organization member to remove.
   * @returns A `DeletedObjectResource` object.
   */
  removeUser: (userId: string) => Promise<DeletedObjectResource>;
}
