/**
 *
 */
export type ClerkResourceReloadParams = {
  /**
   * A nonce to use for rotating the user's token. Used in native application OAuth flows to allow the native client to update its JWT once despite changes in its rotating token.
   */
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
  pathRoot: string;
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  reload(p?: ClerkResourceReloadParams): Promise<this>;
}
