export {};

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
  const JS_PACKAGE_VERSION: string;
  const __DEV__: boolean;
  const __BUILD_ENABLE_RHC__: string;
}
