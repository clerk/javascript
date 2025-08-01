import type { CreateAPIKeyParams, GetAPIKeysParams, RevokeAPIKeyParams } from './clerk';
import type { ClerkPaginatedResponse } from './pagination';
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
  secret?: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKeysNamespace {
  /**
   * @experimental This API is in early access and may change in future releases.
   *
   * Retrieves a paginated list of API keys for the current user or organization.
   */
  getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>>;
  /**
   * @experimental This API is in early access and may change in future releases.
   *
   * Creates a new API key.
   */
  create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
  /**
   * @experimental This API is in early access and may change in future releases.
   *
   * Revokes a given API key by ID.
   */
  revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
