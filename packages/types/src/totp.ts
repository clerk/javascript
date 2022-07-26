import { ClerkResource } from './resource';

export interface TOTPResource extends ClerkResource {
  id: string;
  secret?: string;
  uri?: string;
  verified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
