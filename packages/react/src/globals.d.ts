export {};

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
  const JS_PACKAGE_VERSION: string;
  const __DEV__: boolean;
  var __BUILD_DISABLE_RHC__: boolean; // eslint-disable-line no-var
}
