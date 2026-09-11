import type { DeletedObjectResource } from './deletedObject';
import type { ClerkResourceJSON } from './json';
import type { ClerkPaginatedResponse } from './pagination';
import type { ClerkResource } from './resource';

/**
 * The SCIM provider backing a Directory Sync directory. Derived server-side
 * from the linked enterprise connection's identity provider.
 */
export type DirectorySyncProvider = 'okta' | 'entra' | 'custom' | 'google';

export interface DirectorySyncJSON extends ClerkResourceJSON {
  object: 'directory';
  name: string;
  enterprise_connection_id: string;
  endpoint_url: string;
  provider: DirectorySyncProvider;
  enabled: boolean;
  group_role_mapping_enabled: boolean;
  attribute_mapping: Record<string, string>;
  /**
   * Whether a validated identity-provider credential is stored for this directory. Only present for
   * pull-based providers; push-based directories authenticate with a bearer token and omit it.
   */
  credentials_configured?: boolean | null;
  /**
   * The SCIM bearer token. Only present on create and rotate responses; it
   * cannot be retrieved again afterwards.
   */
  api_key?: string | null;
  created_at: number;
  updated_at: number;
}

export type DirectorySyncJSONSnapshot = Omit<DirectorySyncJSON, 'api_key'> & {
  api_key?: never;
};

export interface DirectorySyncResource extends ClerkResource {
  /** The directory ID. */
  id: string;
  /** The display name of the directory. */
  name: string;
  /** The ID of the organization that owns the directory. */
  organizationId: string;
  /** The ID of the enterprise connection the directory provisions through. */
  enterpriseConnectionId: string;
  /** The SCIM 2.0 endpoint URL the identity provider pushes to. */
  endpointUrl: string;
  /** The SCIM provider, derived from the linked enterprise connection. */
  provider: DirectorySyncProvider;
  /** Whether provisioning is active. */
  enabled: boolean;
  /** Whether directory groups are mapped to organization roles. */
  groupRoleMappingEnabled: boolean;
  /** The SCIM attribute paths mapped onto Clerk user attributes. */
  attributeMapping: Record<string, string>;
  /**
   * Whether a validated identity-provider credential is stored for this directory. `null` for
   * push-based providers, which authenticate with a bearer token and have no credential.
   */
  credentialsConfigured: boolean | null;
  /**
   * The SCIM bearer token. Only populated on the resource returned by
   * `Organization.createDirectorySync` and `rotateToken`; `null` everywhere
   * else — generate a new token if it was lost.
   */
  apiKey: string | null;
  /** The date when the directory was created. */
  createdAt: Date | null;
  /** The date when the directory was last updated. */
  updatedAt: Date | null;
  /**
   * Updates the directory, e.g. to activate or deactivate provisioning.
   */
  update: (params: UpdateDirectorySyncParams) => Promise<DirectorySyncResource>;
  /**
   * Mints a new SCIM bearer token, expiring the previous one after a short grace period. The returned resource is
   * the only place the new token is available.
   */
  rotateToken: () => Promise<DirectorySyncResource>;
  /**
   * Deletes the directory and stops provisioning. Previously provisioned members keep their memberships.
   */
  delete: () => Promise<DeletedObjectResource>;
  /**
   * Gets the users the identity provider has provisioned into the directory.
   */
  getUsers: (params?: GetDirectorySyncUsersParams) => Promise<ClerkPaginatedResponse<DirectorySyncUserResource>>;
  /**
   * Stores the credential a pull-based directory reads the identity provider with, and activates the
   * directory once the provider accepts it. Calling it again replaces the stored credential, which is
   * how a rotated key is applied.
   *
   * The credential is validated against the identity provider before it is stored, so a rejected key or
   * a misconfigured delegation rejects with a message describing what to fix. Surface that message: it
   * is the only thing telling the administrator what is wrong with their setup.
   */
  setCredentials: (params: SetDirectorySyncCredentialsParams) => Promise<DirectorySyncResource>;
  /**
   * Starts a sync for a pull-based directory instead of waiting for the next scheduled one. Rejects
   * while a sync is already running.
   */
  sync: () => Promise<void>;
  /**
   * Gets the result of the directory's most recent sync. Every field is `null` before the first sync
   * completes.
   */
  getSyncStatus: () => Promise<DirectorySyncStatusResource>;
  __internal_toSnapshot: () => DirectorySyncJSONSnapshot;
}

export interface DirectorySyncUserJSON extends ClerkResourceJSON {
  object: 'directory_user';
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  identifier: string | null;
  image_url: string;
  has_image: boolean;
  active: boolean;
  provisioned_at: number;
  updated_at: number;
}

/**
 * A user the identity provider has provisioned into the directory. Carries the same identifying fields as
 * `PublicUserData`.
 */
export interface DirectorySyncUserResource extends ClerkResource {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  /** The user's primary email address. */
  identifier: string | null;
  imageUrl: string;
  hasImage: boolean;
  /** `false` if the identity provider has deprovisioned the user. */
  active: boolean;
  /** The date the user was provisioned into the directory. */
  provisionedAt: Date | null;
  updatedAt: Date | null;
}

export type UpdateDirectorySyncParams = {
  /** Activates (`true`) or deactivates (`false`) provisioning. */
  enabled?: boolean;
  /** Partial attribute mapping to merge into the stored one; `null` values remove keys. */
  attributeMapping?: Record<string, string | null>;
};

export type CreateDirectorySyncParams = {
  /** Optional display name; defaults to the enterprise connection's name. */
  name?: string;
};

export type GetDirectorySyncUsersParams = {
  initialPage?: number;
  pageSize?: number;
};

/**
 * The outcome of a directory's last sync run.
 */
export type DirectorySyncRunStatus = 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface DirectorySyncStatusJSON {
  last_synced_at: number | null;
  last_sync_status: DirectorySyncRunStatus | null;
  last_sync_error: string | null;
}

export interface DirectorySyncStatusResource {
  /** When the last sync finished, or `null` if none has completed. */
  lastSyncedAt: Date | null;
  /** The outcome of the last sync, or `null` if none has completed. */
  lastSyncStatus: DirectorySyncRunStatus | null;
  /** Why the last sync failed, when it did. */
  lastSyncError: string | null;
}

export type SetDirectorySyncCredentialsParams = {
  /** The service account key, as the JSON document downloaded from the identity provider. */
  serviceAccountJson: string;
  /** The directory administrator the service account impersonates when reading the directory. */
  subjectEmail: string;
};
