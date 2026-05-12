import type { CreateAPIKeyParams, GetAPIKeysParams, RevokeAPIKeyParams } from './clerk';
import type { ClerkPaginatedResponse } from './pagination';
import type { ClerkResource } from './resource';

/**
 * The `APIKeys` object provides methods for managing API keys that allow your application's users to grant third-party services programmatic access to your application's API endpoints on their behalf. API keys are long-lived, opaque tokens that can be instantly revoked.
 */
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
   * A description for the API key.
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

/**
 *
 */
export interface APIKeysNamespace {
  /**
   * Gets a paginated list of API keys for the current user or organization.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`APIKeyResource`](https://clerk.com/docs/reference/types/api-key-resource) objects.
   */
  getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>>;
  /**
   * Creates a new API key. **The secret is only available in the response from `create()` and cannot be retrieved later.**
   * @returns A [`APIKeyResource`](https://clerk.com/docs/reference/types/api-key-resource) object that includes the `secret` property.
   * > [!WARNING]
   * > Make sure to store the API key secret immediately after creation, as it will not be available again.
   */
  create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
  /**
   * Revokes a given API key by ID.
   */
  revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
