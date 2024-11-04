import type { ClerkResource } from './resource';

export interface WaitlistResource extends ClerkResource {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
