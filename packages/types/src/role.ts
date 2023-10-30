import type { ClerkResource } from './resource';

export interface RoleResource extends ClerkResource {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
