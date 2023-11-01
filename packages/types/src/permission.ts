import type { ClerkResource } from './resource';

export interface PermissionResource extends ClerkResource {
  id: string;
  key: string;
  name: string;
  type: 'system';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
