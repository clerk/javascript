import type { ClerkResource } from './resource';

/**
 * @experimental
 */
export interface PermissionResource extends ClerkResource {
  id: string;
  key: string;
  name: string;
  type: 'system' | 'user';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
