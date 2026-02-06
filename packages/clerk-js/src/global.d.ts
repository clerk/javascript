declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

declare module '*.worker.ts' {
  const value: string;
  export default value;
}

/**
 * Build time feature flags.
 */
declare const __BUILD_DISABLE_RHC__: string;
declare const __BUILD_VARIANT_CHANNEL__: boolean;
declare const __BUILD_VARIANT_CHIPS__: boolean;
declare const __BUILD_VARIANT_EXPERIMENTAL__: boolean;

declare const __DEV__: boolean;
declare const __PKG_NAME__: string;
declare const __PKG_VERSION__: string;

interface Window {
  __internal_onBeforeSetActive: (intent?: 'sign-out') => Promise<void> | void;
  __internal_onAfterSetActive: () => Promise<void> | void;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  __internal_ClerkUICtor?: import('@clerk/shared/types').ClerkUiConstructor;
  /**
   * Promise used for coordination between standalone getToken() from @clerk/shared and clerk-js.
   * When getToken() is called before Clerk loads, it creates this promise with __resolve/__reject callbacks.
   * When Clerk reaches ready/degraded/error status, it resolves/rejects this promise.
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  __clerk_internal_ready?: Promise<import('@clerk/shared/types').LoadedClerk> & {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    __resolve?: (clerk: import('@clerk/shared/types').LoadedClerk) => void;
    __reject?: (error: Error) => void;
  };
}
