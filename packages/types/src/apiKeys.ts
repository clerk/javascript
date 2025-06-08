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
  getAll(params?: GetAPIKeysParams): Promise<APIKeyResource[]>;
  getSecret(id: string): Promise<string>;
  create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
  revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
