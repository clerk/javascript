import { ClerkResource } from './resource';

export interface ImageResource extends ClerkResource {
  id?: string;
  name: string | null;
  publicUrl: string | null;
}
