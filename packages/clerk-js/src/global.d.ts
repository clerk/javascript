declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

declare const __PKG_NAME__: string;
declare const __PKG_VERSION__: string;
declare const __DEV__: boolean;

/**
 * Build time feature flags.
 */
declare const __BUILD_DISABLE_RHC__: string;
declare const __BUILD_VARIANT_CHIPS__: boolean;

interface Window {
  __unstable__onBeforeSetActive: (intent?: 'sign-out') => Promise<void> | void;
  __unstable__onAfterSetActive: () => Promise<void> | void;
}
