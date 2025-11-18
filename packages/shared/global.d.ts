declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const JS_PACKAGE_VERSION: string;
declare const __DEV__: boolean;
declare const __BUILD_DISABLE_RHC__: boolean;
declare const __CLERK_USE_RQ__: boolean;

interface ImportMetaEnv {
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
