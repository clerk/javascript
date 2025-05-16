import type { ClerkResource } from './resource';

export interface ApiKeyResource extends ClerkResource {
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
  createdAt: Date;
  updatedAt: Date;
}
