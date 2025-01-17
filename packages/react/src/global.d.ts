declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const JS_PACKAGE_VERSION: string;
declare const __DEV__: boolean;

declare module globalThis {
  // eslint-disable-next-line no-var
  var __BUILD_DISABLE_RHC__: boolean;
}
