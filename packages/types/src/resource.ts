export type ClerkResourceReloadParams = {
  rotatingTokenNonce?: string;
};

/**
 * Defines common properties and methods that all Clerk resources must implement.
 */
export interface ClerkResource {
  /**
   * The unique identifier of the resource.
   */
  readonly id?: string | undefined;
  /**
   * The root path of the resource.
   */
  pathRoot: string;
  /**
   * Reload the resource and return the resource itself.
   */
  reload(p?: ClerkResourceReloadParams): Promise<this>;
}
