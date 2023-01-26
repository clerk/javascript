import type { ClerkResource } from './resource';

export interface TOTPResource extends ClerkResource {
  id: string;
  secret?: string;
  uri?: string;
  verified: boolean;
  backupCodes?: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}
