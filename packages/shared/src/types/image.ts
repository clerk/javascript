import type { ClerkResource } from './resource';

/** Represents information about an image. */
export interface ImageResource extends ClerkResource {
  /**
   * The unique identifier of the image.
   */
  id?: string;
  /**
   * The name of the image.
   */
  name: string | null;
  /**
   * The public URL of the image.
   */
  publicUrl: string | null;
}
