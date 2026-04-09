import type { CreateAPIKeyParams, GetAPIKeysParams, RevokeAPIKeyParams } from './clerk';
import type { ClerkPaginatedResponse } from './pagination';
import type { ClerkResource } from './resource';

export interface APIKeyResource extends ClerkResource {
  /**
   * A unique identifier for the API key.
   */
  id: string;
  /**
   * The type of the API key.
   */
  type: string;
  /**
   * The name of the API key.
   */
  name: string;
  /**
   * The user or organization ID that the API key is associated with.
   */
  subject: string;
  /**
   * An array of scopes that define what the API key can access.
   */
  scopes: string[];
  /**
   * Custom claims associated with the API key, or `null` if none.
   */
  claims: Record<string, any> | null;
  /**
   * Indicates whether the API key has been revoked.
   */
  revoked: boolean;
  /**
   * The reason the API key was revoked, or `null` if not revoked.
   */
  revocationReason: string | null;
  /**
   * Indicates whether the API key has expired.
   */
  expired: boolean;
  /**
   * The expiration date and time for the API key, or `null` if the key never expires.
   */
  expiration: Date | null;
  /**
   * The ID of the user that created the API key.
   */
  createdBy: string | null;
  /**
   * An optional description for the API key.
   */
  description: string | null;
  /**
   * The API key secret. **This property is only present in the response from [`create()`](https://clerk.com/docs/reference/objects/api-keys#create) and cannot be retrieved later.**
   */
  secret?: string;
  /**
   * The date and time when the API key was last used to authenticate a request, or `null` if it has never been used.
   */
  lastUsedAt: Date | null;
  /**
   * The date and time when the API key was created.
   */
  createdAt: Date;
  /**
   * The date and time when the API key was last updated.
   */
  updatedAt: Date;
}

export interface APIKeysNamespace {
  /**
   * Retrieves a paginated list of API keys for the current user or organization.
   */
  getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>>;
  /**
   * Creates a new API key.
   */
  create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
  /**
   * Revokes a given API key by ID.
   */
  revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
