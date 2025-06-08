import type { CreateAPIKeyParams, GetAPIKeysParams, RevokeAPIKeyParams } from './clerk';
import type { ClerkResource } from './resource';

export interface APIKeyResource extends ClerkResource {
  id: string;
  type: string;
  name: string;
  subject: string;
  scopes: string[];
  claims: Record<string, any> | null;
  revoked: boolean;
  revocationReason: string | null;
  expired: boolean;
  expiration: Date | null;
  createdBy: string | null;
  description: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKeysNamespace {
  /**
   * @experimental
   * This API is in early access and may change in future releases.
   *
   * Retrieves all API keys for the current user or organization.
   */
  getAll(params?: GetAPIKeysParams): Promise<APIKeyResource[]>;
  /**
   * @experimental
   * This API is in early access and may change in future releases.
   *
   * Retrieves the secret for a given API key ID.
   */
  getSecret(id: string): Promise<string>;
  /**
   * @experimental
   * This API is in early access and may change in future releases.
   *
   * Creates a new API key.
   */
  create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
  /**
   * @experimental
   * This API is in early access and may change in future releases.
   *
   * Revokes a given API key by ID.
   */
  revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
