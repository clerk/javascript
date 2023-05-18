import type { ClerkResource } from './resource';

export interface ImageResource extends ClerkResource {
  id?: string;
  name: string | null;
  publicUrl: string | null;
}

export interface EncodedImageData {
  type: 'default' | 'proxy';
  iid?: string;
  rid?: string;
  src?: string;
  initials?: string;
}
