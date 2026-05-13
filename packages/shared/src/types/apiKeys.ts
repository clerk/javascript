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
