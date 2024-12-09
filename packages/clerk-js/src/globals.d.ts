declare global {
  const __DEV__: boolean;
  const __PKG_NAME__: string;
  const __PKG_VERSION__: string;
  /**
   * Build time feature flags.
   */
  const __BUILD_FLAG_KEYLESS_UI__: boolean;
  const __BUILD_DISABLE_RHC__: string;

  interface Window {
    __unstable__onBeforeSetActive: () => Promise<void> | void;
    __unstable__onAfterSetActive: () => Promise<void> | void;
  }
}

declare module '*.svg' {
  const value: React.FC<React.SVGAttributes<SVGElement>>;
  export default value;
}

export {};
