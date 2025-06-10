export type ClerkResourceReloadParams = {
  rotatingTokenNonce?: string;
};

/**
 * Minimal store interface to avoid importing zustand in types package
 */
export interface ResourceStoreApi<T = any> {
  getState: () => T;
  setState: {
    (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false | undefined): void;
    (state: T | ((state: T) => T), replace: true): void;
  };
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}

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
  /**
   * The reactive store for this resource
   */
  store: ResourceStoreApi;
}
