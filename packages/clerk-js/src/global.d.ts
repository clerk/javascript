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
  __internal_ClerkUiCtor?: import('@clerk/shared/types').ClerkUiConstructor;
}
