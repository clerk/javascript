import type { PermissionResource } from './permission';
import type { ClerkResource } from './resource';

/**
 * @experimental
 */
export interface RoleResource extends ClerkResource {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: PermissionResource[];
  createdAt: Date;
  updatedAt: Date;
}
