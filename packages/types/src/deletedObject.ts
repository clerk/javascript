import type { ClerkResource } from './resource';

export interface DeletedObjectResource extends ClerkResource {
  object: string;
  id?: string;
  slug?: string;
  deleted: boolean;
}
