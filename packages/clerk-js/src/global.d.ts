declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

const __PKG_NAME__: string;
const __PKG_VERSION__: string;
const __DEV__: boolean;

/**
 * Build time feature flags.
 */
const __BUILD_DISABLE_RHC__: string;
const __BUILD_VARIANT_CHANNEL__: boolean;
const __BUILD_VARIANT_CHIPS__: boolean;

interface Window {
  __internal_onBeforeSetActive: (intent?: 'sign-out') => Promise<void> | void;
  __internal_onAfterSetActive: () => Promise<void> | void;
  __internal_ClerkUiCtor?: import('@clerk/shared').ClerkUiConstructor;
}
