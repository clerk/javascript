declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const JS_PACKAGE_VERSION: string;
declare const __DEV__: boolean;

interface ImportMetaEnv {
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
